"use server"

import { CreateCategoryParams } from "@/types"
import { handleError } from "../utils"
import { connectToDatabase } from "../database"
import Category from "../database/models/category.model"

export const createCategory = async ({ categoryName }: CreateCategoryParams) => {
  try {
    await connectToDatabase();

    const newCategory = await Category.create({ name: categoryName });

    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error)
  }
}

export const getAllCategories = async () => {
  try {
    await connectToDatabase();

    const categories = await Category.find();

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.warn("MongoDB not connected yet, returning default categories:", error);
    return [
      { _id: 'cat-1', name: 'Technology' },
      { _id: 'cat-2', name: 'Hackathon' },
      { _id: 'cat-3', name: 'Design' },
      { _id: 'cat-4', name: 'Business' },
      { _id: 'cat-5', name: 'Music' },
      { _id: 'cat-6', name: 'Film' },
      { _id: 'cat-7', name: 'Food' },
      { _id: 'cat-8', name: 'Art' },
      { _id: 'cat-9', name: 'Fashion' },
      { _id: 'cat-10', name: 'Sports' },
    ];
  }
}