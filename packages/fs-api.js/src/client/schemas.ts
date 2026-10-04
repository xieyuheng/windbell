import type {
  FileSystemEntry,
  FileTypeKind,
  InspectFileResult,
} from "../service/fileSystem.ts"
import { z } from "zod"

export const StringSchema = z.string()

export const BooleanSchema = z.boolean()

export const StringListSchema = z.array(z.string())

export const FileTypeKindSchema: z.ZodType<FileTypeKind> = z.enum([
  "Text",
  "Image",
  "Pdf",
  "Archive",
  "Binary",
  "Unknown",
])

export const FileSystemEntrySchema: z.ZodType<FileSystemEntry> = z.object({
  name: z.string(),
  path: z.string(),
  kind: z.enum(["File", "Directory"]),
})

export const FileSystemEntryListSchema: z.ZodType<Array<FileSystemEntry>> =
  z.array(FileSystemEntrySchema)

export const InspectFileResultSchema: z.ZodType<InspectFileResult> = z.object({
  kind: FileTypeKindSchema,
  mimeType: z.string().optional(),
  size: z.number(),
})

export const VoidSchema: z.ZodType<void> = z
  .null()
  .transform((): void => undefined)
