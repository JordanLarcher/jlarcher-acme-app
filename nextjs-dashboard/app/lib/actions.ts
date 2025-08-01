'use server';
import { z } from 'zod';
import postgres from "postgres";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


const sql = postgres(process.env.POSTGRES_URL!, { ssl: true });

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.string(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});


const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string){
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}
