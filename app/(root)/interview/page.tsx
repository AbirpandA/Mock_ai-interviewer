import Agents from '@/components/Agents'
import { getCurrentUser } from '@/lib/actions/auth.action'
import React from 'react'

const page = async() => {
  const user=await getCurrentUser()
  return (
    <>
    <h2>Interview generation</h2>

    <Agents userName={user?.name}  userId={user?.id} type="generate" />
    </>
  )
}

export default page