import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Check if the request is from an authenticated admin
 * This checks for the admin authentication cookie or header
 */
export async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    // Check for custom header (for API calls from authenticated frontend)
    const adminHeader = request.headers.get('x-admin-authenticated')
    if (adminHeader === 'true') {
      return true
    }
    
    // Check for admin authentication cookie
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin_authenticated')
    
    return adminAuth?.value === 'true'
  } catch (error) {
    // If cookies() fails (e.g., in edge runtime), fall back to header only
    const adminHeader = request.headers.get('x-admin-authenticated')
    return adminHeader === 'true'
  }
}

/**
 * Get admin authentication response for unauthorized requests
 */
export function getUnauthorizedResponse() {
  return Response.json(
    { error: 'Unauthorized. Admin authentication required.' },
    { status: 401 }
  )
}

