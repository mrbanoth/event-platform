"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { eventFormSchema } from "@/lib/validator"
import * as z from 'zod'
import { eventDefaultValues } from "@/constants"
import Dropdown from "./Dropdown"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "./FileUploader"
import { useState, useEffect } from "react"
import Image from "next/image"
import DatePicker from "react-datepicker";
import { useUploadThing } from '@/lib/uploadthing'

import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox"
import { useRouter } from "next/navigation"
import { createEvent, updateEvent } from "@/lib/actions/event.actions"
import { IEvent } from "@/lib/database/models/event.model"


type EventFormProps = {
  userId: string
  type: "Create" | "Update"
  event?: IEvent,
  eventId?: string
}

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(false)

  const initialValues = event && type === 'Update' 
    ? { 
      ...event, 
      startDateTime: new Date(event.startDateTime), 
      endDateTime: new Date(event.endDateTime) 
    }
    : eventDefaultValues;
  const router = useRouter();

  const { startUpload } = useUploadThing('imageUploader')

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues
  })

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (type !== 'Create') return;

    try {
      const savedDraft = localStorage.getItem('tribely_event_form_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        form.reset({
          ...parsed,
          startDateTime: parsed.startDateTime ? new Date(parsed.startDateTime) : new Date(),
          endDateTime: parsed.endDateTime ? new Date(parsed.endDateTime) : new Date(),
        });
        setHasDraft(true);
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }

    // Auto-save form fields to localStorage as the user types
    const subscription = form.watch((values) => {
      try {
        localStorage.setItem('tribely_event_form_draft', JSON.stringify(values));
        setHasDraft(true);
      } catch (err) {
        // quota exceeded or private mode
      }
    });

    return () => subscription.unsubscribe();
  }, [form, type]);

  const clearDraft = () => {
    localStorage.removeItem('tribely_event_form_draft');
    form.reset(eventDefaultValues);
    setFiles([]);
    setHasDraft(false);
    setErrorMessage(null);
  };
 
  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    setErrorMessage(null);
    let uploadedImageUrl = values.imageUrl;

    if(files.length > 0) {
      try {
        const uploadedImages = await startUpload(files)

        if(!uploadedImages) {
          setErrorMessage('Image upload failed. Please ensure your image is under 4MB.')
          return
        }

        uploadedImageUrl = uploadedImages[0].url
      } catch (uploadErr: any) {
        setErrorMessage(uploadErr.message || 'Failed to upload image. Please check your image file.')
        return
      }
    }

    if(type === 'Create') {
      try {
        const newEvent = await createEvent({
          event: { ...values, imageUrl: uploadedImageUrl },
          userId,
          path: '/profile'
        })

        if(newEvent) {
          localStorage.removeItem('tribely_event_form_draft');
          form.reset();
          router.push(`/profile?created=true&event=${encodeURIComponent(newEvent.title)}#events-organized`)
        } else {
          setErrorMessage('Could not create event. Please verify your login session.')
        }
      } catch (error: any) {
        console.error('Error creating event:', error);
        setErrorMessage(error?.message || 'Server error occurred while creating event. Please try again.')
      }
    }

    if(type === 'Update') {
      if(!eventId) {
        router.back()
        return;
      }

      try {
        const updatedEvent = await updateEvent({
          userId,
          event: { ...values, imageUrl: uploadedImageUrl, _id: eventId },
          path: `/events/${eventId}`
        })

        if(updatedEvent) {
          form.reset();
          router.push(`/events/${updatedEvent._id}?updated=true`)
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {hasDraft && type === 'Create' && (
          <div className="flex items-center justify-between py-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Draft
            </span>
            <button
              type="button"
              onClick={clearDraft}
              className="text-xs text-gray-400 hover:text-red-500 transition underline underline-offset-2"
            >
              Clear draft
            </button>
          </div>
        )}

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Event title" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Dropdown onChangeHandler={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <Textarea placeholder="Description" {...field} className="textarea rounded-2xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <FileUploader 
                      onFieldChange={field.onChange}
                      imageUrl={field.value}
                      setFiles={setFiles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/location-grey.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                      />

                      <Input placeholder="Event location or Online" {...field} className="input-field" />
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">Start Date:</p>
                      <DatePicker 
                        selected={field.value} 
                        onChange={(date: Date) => field.onChange(date)} 
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker"
                      />
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        
          <FormField
              control={form.control}
              name="endDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">End Date:</p>
                      <DatePicker 
                        selected={field.value} 
                        onChange={(date: Date) => field.onChange(date)} 
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker"
                      />
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/dollar.svg"
                        alt="dollar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <Input type="number" placeholder="Price" {...field} className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                <label htmlFor="isFree" className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Free Ticket</label>
                                <Checkbox
                                  onCheckedChange={field.onChange}
                                  checked={field.value}
                                id="isFree" className="mr-2 h-5 w-5 border-2 border-primary-500" />
                              </div>
          
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />   
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />   
           <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/link.svg"
                        alt="link"
                        width={24}
                        height={24}
                      />

                      <Input placeholder="URL" {...field} className="input-field" />
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>


        <Button 
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting ? (
            'Submitting...'
          ): `${type} Event `}</Button>
      </form>
    </Form>
  )
}

export default EventForm