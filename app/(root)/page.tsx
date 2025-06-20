import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { dummyInterviews } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <>
    <section className='card-cta'>
      <div className='flex flex-col gap-6 max-w-lg'>
        <h2>Get Interview Ready </h2>
        <p className='text-lg'>Become batman of your interviews</p>
        <Button asChild className='btn-primary max-sm:w-full'>
          <Link href='/interviews'>Start Interview</Link>
        </Button>

      </div>
        <Image src='/batman.png' alt='batman' width={400} height={400} className='max-sm:hidden'/>
    </section>

    <section className='flex flex-col gap-6 mt-8'>
      <h2>Your Interviews</h2>
      <div className='interviews-section'>
        {dummyInterviews.map(interview=>(
          <InterviewCard key={interview.id} {...interview} />
        ))}
        {/* <p>you have&apos;t taken any interviews Yet </p> */}
      </div>

    </section>

    <section className='flex flex-col gap-6 mt-8'>
      <h2>Take an interview</h2>
      <div className='interviews-section'>
        {dummyInterviews.map(interview=>(
          <InterviewCard key={interview.id} {...interview} />
        ))}
      </div>
    </section>
    </>
  )
}

export default page