import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
        <Link href='/'>
          <Image 
            src="/assets/images/logo.svg"
            alt="Tribely logo"
            width={160}
            height={42}
            className="w-auto h-9 object-contain"
          />
        </Link>

        <p>{new Date().getFullYear()} Tribely. All Rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer