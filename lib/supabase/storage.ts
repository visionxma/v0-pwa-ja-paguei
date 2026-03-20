import { createClient } from './client'

const BUCKET = 'bill-attachments'

export async function uploadAttachment(
  file: File,
  userId: string,
): Promise<{ url: string; name: string; type: string }> {
  const supabase = createClient()

  const ext = file.name.split('.').pop() || 'bin'
  const safeName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(safeName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error(`Erro ao enviar arquivo: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(safeName)

  return {
    url: urlData.publicUrl,
    name: file.name,
    type: file.type,
  }
}

export async function deleteAttachment(fileUrl: string): Promise<void> {
  const supabase = createClient()

  // Extract path from full URL
  const bucketPath = fileUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1]
  if (!bucketPath) return

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([bucketPath])

  if (error) throw new Error(`Erro ao deletar arquivo: ${error.message}`)
}

export async function saveAttachmentRecord(
  billId: string,
  userId: string,
  attachment: { url: string; name: string; type: string },
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('bill_attachments')
    .insert({
      bill_id: billId,
      uploaded_by: userId,
      file_url: attachment.url,
      file_name: attachment.name,
      file_type: attachment.type,
    })

  if (error) throw new Error(`Erro ao salvar anexo: ${error.message}`)
}

export async function getAttachments(billId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('bill_attachments')
    .select('*')
    .eq('bill_id', billId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao carregar anexos: ${error.message}`)
  return data || []
}

export async function deleteAttachmentRecord(attachmentId: string, fileUrl: string) {
  await deleteAttachment(fileUrl)

  const supabase = createClient()
  const { error } = await supabase
    .from('bill_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw new Error(`Erro ao remover anexo: ${error.message}`)
}
