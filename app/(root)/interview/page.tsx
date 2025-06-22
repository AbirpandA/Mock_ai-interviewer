import Agents from '@/components/Agents'
import React from 'react'

const page = () => {
  return (
    <>
    <h2>Interview generation</h2>

    <Agents userName="You"  userId="user1" type="generate" />
    </>
  )
}

export default page