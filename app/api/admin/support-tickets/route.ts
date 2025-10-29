import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/admin-auth';
import { Database } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Get all support tickets with user information
    const ticketsQuery = `
      SELECT 
        st.id,
        st.user_id,
        st.subject,
        st.message,
        st.priority,
        st.status,
        st.created_at,
        st.updated_at,
        u.email as user_email,
        u.name as user_name
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
    `;
    
    const tickets = await Database.queryMany(ticketsQuery);

    return NextResponse.json({
      success: true,
      tickets
    });

  } catch (error) {
    console.error('Admin support tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'Missing ticketId or status' },
        { status: 400 }
      );
    }

    // Update ticket status
    const updateQuery = `
      UPDATE support_tickets 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const updatedTicket = await Database.queryOne(updateQuery, [status, ticketId]);

    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Update support ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


