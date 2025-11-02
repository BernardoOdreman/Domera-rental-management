"use client"

import type React from "react"

import { useState } from "react"
import {
  FileText,
  Upload,
  Folder,
  Search,
  Grid3X3,
  List,
  File,
  FileSpreadsheet,
  FileIcon as FilePdf,
  FileImage,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// Sample document data
const SAMPLE_DOCUMENTS = [
  {
    id: "1",
    name: "Lease Agreement - 123 Main St.pdf",
    type: "pdf",
    size: "2.4 MB",
    category: "Leases",
    lastModified: "2025-02-15T14:30:00",
    tags: ["lease", "signed", "important"],
  },
  {
    id: "2",
    name: "Tenant Payment History.xlsx",
    type: "spreadsheet",
    size: "1.8 MB",
    category: "Financial",
    lastModified: "2025-03-01T09:15:00",
    tags: ["payments", "financial", "records"],
  },
  {
    id: "3",
    name: "Property Inspection Report.pdf",
    type: "pdf",
    size: "3.2 MB",
    category: "Inspections",
    lastModified: "2025-02-28T16:45:00",
    tags: ["inspection", "report"],
  },
  {
    id: "4",
    name: "Maintenance Receipts.xlsx",
    type: "spreadsheet",
    size: "1.2 MB",
    category: "Maintenance",
    lastModified: "2025-03-05T11:20:00",
    tags: ["maintenance", "expenses", "receipts"],
  },
  {
    id: "5",
    name: "Property Photos.jpg",
    type: "image",
    size: "5.7 MB",
    category: "Properties",
    lastModified: "2025-01-20T10:00:00",
    tags: ["photos", "property"],
  },
  {
    id: "6",
    name: "Tax Documents 2024.pdf",
    type: "pdf",
    size: "4.1 MB",
    category: "Financial",
    lastModified: "2025-02-10T13:30:00",
    tags: ["tax", "financial", "important"],
  },
  {
    id: "7",
    name: "Tenant Application Form.pdf",
    type: "pdf",
    size: "1.5 MB",
    category: "Tenants",
    lastModified: "2025-03-08T15:10:00",
    tags: ["application", "tenant"],
  },
  {
    id: "8",
    name: "Property Expense Tracker.xlsx",
    type: "spreadsheet",
    size: "2.3 MB",
    category: "Financial",
    lastModified: "2025-03-10T09:45:00",
    tags: ["expenses", "financial", "tracking"],
  },
]

// Categories with counts
const CATEGORIES = [
  { name: "All Documents", count: SAMPLE_DOCUMENTS.length },
  { name: "Leases", count: SAMPLE_DOCUMENTS.filter((doc) => doc.category === "Leases").length },
  { name: "Financial", count: SAMPLE_DOCUMENTS.filter((doc) => doc.category === "Financial").length },
  { name: "Inspections", count: SAMPLE_DOCUMENTS.filter((doc) => doc.category === "Inspections").length },
  { name: "Maintenance", count: SAMPLE_DOCUMENTS.filter((doc) => doc.category === "Maintenance").length },
  { name: "Properties", count: SAMPLE_DOCUMENTS.filter((doc) => doc.category === "Properties").length },
  { name: "Tenants", count: SAMPLE_DOCUMENTS.filter((doc) => doc.category === "Tenants").length },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(SAMPLE_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Documents")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Get all unique tags
  const allTags = Array.from(new Set(SAMPLE_DOCUMENTS.flatMap((doc) => doc.tags)))

  // Filter documents based on search, category, and tags
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Documents" || doc.category === selectedCategory
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => doc.tags.includes(tag))
    return matchesSearch && matchesCategory && matchesTags
  })

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you would upload the file to a server
      // For this demo, we'll just add it to our local state
      const newDocuments = Array.from(e.target.files).map((file, index) => {
        const fileType = file.name.split(".").pop()?.toLowerCase() || ""
        let type = "file"

        if (["xlsx", "xls", "csv"].includes(fileType)) type = "spreadsheet"
        else if (["pdf"].includes(fileType)) type = "pdf"
        else if (["jpg", "jpeg", "png", "gif"].includes(fileType)) type = "image"

        return {
          id: `new-${Date.now()}-${index}`,
          name: file.name,
          type,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          category: "Uncategorized",
          lastModified: new Date().toISOString(),
          tags: [],
        }
      })

      setDocuments([...newDocuments, ...documents])
      setIsUploadDialogOpen(false)
    }
  }

  // Get icon based on document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FilePdf className="h-6 w-6 text-red-500" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />
      case "image":
        return <FileImage className="h-6 w-6 text-blue-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-muted-foreground">Upload, organize, and manage your important documents</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-foreground">Upload Documents</DialogTitle>
              <DialogDescription>
                Upload documents to your document library. Supported formats include PDF, Excel, CSV, and image files.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="files" className="text-foreground">
                  Files
                </Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Drag and drop files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">PDF, Excel, CSV, and image files are supported</p>
                  <Input id="files" type="file" multiple className="hidden" onChange={handleFileUpload} />
                  <Button size="sm" onClick={() => document.getElementById("files")?.click()}>
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1" noHover>
          <CardHeader>
            <CardTitle className="text-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-4">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    className={`flex items-center justify-between w-full p-2 rounded-md text-left mb-1 ${
                      selectedCategory === category.name
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center">
                      <Folder
                        className={`h-4 w-4 mr-2 ${
                          selectedCategory === category.name ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span>{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.count}</Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardHeader>
            <CardTitle className="text-foreground">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X
                      className="ml-1 h-3 w-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTag(tag)
                      }}
                    />
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8">
              <FileText className="h-16 w-16 mb-4 text-muted-foreground" />
              <h2 className="text-xl font-medium mb-2 text-foreground">No documents found</h2>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || selectedTags.length > 0 || selectedCategory !== "All Documents"
                  ? "Try adjusting your search or filters"
                  : "Upload documents to get started"}
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </Button>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      {getDocumentIcon(doc.type)}
                      <Badge variant="outline">{doc.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <h3 className="font-medium truncate text-foreground" title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{doc.size}</span>
                      <span>{formatDate(doc.lastModified)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {doc.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center p-4 hover:bg-muted/50">
                      <div className="mr-4">{getDocumentIcon(doc.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-foreground" title={doc.name}>
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline">{doc.category}</Badge>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(doc.lastModified)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
