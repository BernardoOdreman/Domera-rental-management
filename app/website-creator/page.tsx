"use client"

import { useState, useEffect } from "react"
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Eye,
  Palette,
  Globe,
  ArrowRight,
  Zap,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Sample templates with more detailed information
const templates = [
  {
    id: "landing",
    name: "Modern Landing Page",
    description: "A sleek, conversion-focused landing page for your property business",
    preview: "/modern-property-hero.png",
    features: ["Hero section", "Features showcase", "Testimonials", "Contact form"],
    complexity: "Simple",
    bestFor: "New property listings",
  },
  {
    id: "property-listing",
    name: "Property Listing Portal",
    description: "Showcase your properties with detailed listings and search functionality",
    preview: "/modern-property-search.png",
    features: ["Property search", "Detailed listings", "Photo galleries", "Contact forms"],
    complexity: "Advanced",
    bestFor: "Property managers with multiple listings",
  },
  {
    id: "blog",
    name: "Real Estate Blog",
    description: "Share your expertise and attract potential clients with a professional blog",
    preview: "/modern-real-estate-blog.png",
    features: ["Article categories", "Featured posts", "Author profiles", "Newsletter signup"],
    complexity: "Moderate",
    bestFor: "Building authority in real estate",
  },
]

// Sample generated code (simplified for demo)
const sampleCode = `
import React from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

export default function PropertyListing() {
 return (
   <div className="container mx-auto py-8">
     <h1 className="text-3xl font-bold mb-6">Featured Properties</h1>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <Card>
         <img src="/property1.jpg" alt="Property" className="w-full h-48 object-cover" />
         <div className="p-4">
           <h2 className="text-xl font-semibold">Modern Apartment</h2>
           <p className="text-gray-600">123 Main St, Anytown</p>
           <p className="text-lg font-bold mt-2">$1,200/month</p>
           <Button className="mt-4 w-full">View Details</Button>
         </div>
       </Card>
       {/* More property cards would go here */}
     </div>
   </div>
 );
}
`

export default function WebsiteCreatorPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("templates")
  const [prompt, setPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [websiteType, setWebsiteType] = useState("landing")
  const [websiteName, setWebsiteName] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "deploying" | "success" | "error">("idle")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Fix for ResizeObserver loop error
  useEffect(() => {
    // This helps prevent ResizeObserver loops by deferring non-critical observations
    const handleError = (error: ErrorEvent) => {
      if (
        error.message.includes("ResizeObserver") ||
        error.message.includes("ResizeObserver loop completed with undelivered notifications")
      ) {
        // Prevent the error from propagating
        error.stopImmediatePropagation()
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  // Filter templates based on search query
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGenerate = () => {
    setIsGenerating(true)

    // Simulate API call to v0
    setTimeout(() => {
      setGeneratedCode(sampleCode)
      setIsGenerating(false)

      // Use a separate timeout for tab change to avoid layout thrashing
      setTimeout(() => {
        setActiveTab("preview")
        setPreviewLoading(true)

        // Simulate preview loading
        setTimeout(() => {
          setPreviewLoading(false)
        }, 1500)
      }, 100)

      toast({
        title: "Website generated!",
        description: "Your website code has been generated successfully.",
      })
    }, 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)

    toast({
      title: "Code copied!",
      description: "The generated code has been copied to your clipboard.",
    })
  }

  const handleDeploy = () => {
    setDeploymentStatus("deploying")

    toast({
      title: "Deployment started",
      description: "Your website is being deployed. This may take a few minutes.",
    })

    // Simulate deployment
    setTimeout(() => {
      setDeploymentStatus("success")
      toast({
        title: "Website deployed!",
        description: "Your website is now live at https://your-site.vercel.app",
      })
    }, 3000)
  }

  // Safely change steps with proper timing to avoid layout thrashing
  const changeStep = (newStep: number) => {
    // Use requestAnimationFrame to ensure we're not in the middle of a layout calculation
    requestAnimationFrame(() => {
      setCurrentStep(newStep)
    })
  }

  // Safely change tabs with proper timing
  const handleTabChange = (value: string) => {
    // Use requestAnimationFrame to ensure we're not in the middle of a layout calculation
    requestAnimationFrame(() => {
      setActiveTab(value)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Website Creator</h1>
        <p className="text-muted-foreground">Create custom websites for your properties with AI assistance</p>
      </div>

      <Tabs defaultValue="templates" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Custom Design
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedCode} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="deploy" disabled={!generatedCode} className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Deploy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`dashboard-card cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-3 right-3 bg-black/70 text-white">{template.complexity}</Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Best for: {template.bestFor}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTemplate(template.id)
                      setWebsiteType(template.id)

                      // Use setTimeout to avoid layout thrashing
                      setTimeout(() => {
                        handleTabChange("custom")
                      }, 50)
                    }}
                  >
                    {selectedTemplate === template.id ? "Selected" : "Use Template"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Your Website</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </div>
              </div>
              <CardDescription>
                Follow these steps to create the perfect website for your property business
              </CardDescription>

              {/* Enhanced progress bar with step indicators */}
              <div className="mt-4 mb-2">
                <div className="flex justify-between mb-1">
                  {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1
                    return (
                      <div key={stepNum} className="flex flex-col items-center relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                            stepNum < currentStep
                              ? "bg-primary border-primary text-primary-foreground"
                              : stepNum === currentStep
                                ? "border-primary text-primary"
                                : "border-muted bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {stepNum < currentStep ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-medium">{stepNum}</span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-1 text-center max-w-[80px] ${
                            stepNum === currentStep ? "font-medium text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {stepNum === 1 ? "Type" : stepNum === 2 ? "Design" : stepNum === 3 ? "Content" : "Review"}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="relative mt-3">
                  <div className="absolute top-0 left-0 h-1 bg-muted w-full rounded-full">
                    <div
                      className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    ></div>
                    {Array.from({ length: totalSteps - 1 }).map((_, index) => {
                      const position = (index / (totalSteps - 1)) * 100
                      return (
                        <div
                          key={index}
                          className={`absolute top-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 transition-colors duration-300 ${
                            (index + 1) < currentStep ? "bg-primary" : "bg-muted-foreground/50"
                          }`}
                          style={{ left: `${position}%` }}
                        ></div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="min-h-[400px]">
              {/* Step 1: Website Type & Purpose */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Step 1: Website Type & Purpose</h3>
                    <p className="text-sm text-muted-foreground">
                      Let's start by defining what type of website you need and its main purpose
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website-name">Website Name</Label>
                      <Input
                        id="website-name"
                        placeholder="e.g., Smith Properties"
                        value={websiteName}
                        onChange={(e) => setWebsiteName(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        This will appear in the header and title of your website
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Website Type</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          {
                            id: "landing",
                            name: "Landing Page",
                            icon: <Palette className="h-5 w-5 mb-1" />,
                            description: "A single page to showcase your business",
                          },
                          {
                            id: "property-listing",
                            name: "Property Listings",
                            icon: <Search className="h-5 w-5 mb-1" />,
                            description: "Display multiple properties with details",
                          },
                          {
                            id: "blog",
                            name: "Real Estate Blog",
                            icon: <FileText className="h-5 w-5 mb-1" />,
                            description: "Share insights and attract clients",
                          },
                        ].map((type) => (
                          <div
                            key={type.id}
                            className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:border-primary/50 ${
                              websiteType === type.id ? "border-primary bg-primary/5" : ""
                            }`}
                            onClick={() => setWebsiteType(type.id)}
                          >
                            <div className="flex flex-col items-center">
                              {type.icon}
                              <h4 className="font-medium">{type.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website-purpose">Primary Goal</Label>
                      <Select defaultValue="attract">
                        <SelectTrigger>
                          <SelectValue placeholder="Select the main purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attract">Attract New Clients</SelectItem>
                          <SelectItem value="showcase">Showcase Properties</SelectItem>
                          <SelectItem value="generate">Generate Leads</SelectItem>
                          <SelectItem value="inform">Provide Information</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Design & Branding */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Step 2: Design & Branding</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose the visual style and branding elements for your website
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Color Scheme</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { name: "Professional Blue", color: "bg-blue-500", border: "border-blue-600" },
                          { name: "Elegant Green", color: "bg-green-500", border: "border-green-600" },
                          { name: "Luxury Purple", color: "bg-purple-500", border: "border-purple-600" },
                          { name: "Warm Amber", color: "bg-amber-500", border: "border-amber-600" },
                        ].map((scheme) => (
                          <div key={scheme.name} className="space-y-2">
                            <div
                              className={`h-12 rounded-md cursor-pointer border-2 ${scheme.color} ${scheme.border}`}
                              title={scheme.name}
                            />
                            <p className="text-xs text-center">{scheme.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Layout Style</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                          <div className="h-16 bg-muted mb-2 rounded"></div>
                          <div className="h-4 bg-muted/70 rounded mb-1"></div>
                          <div className="h-4 bg-muted/70 rounded w-2/3"></div>
                          <p className="text-xs text-center mt-2">Modern & Clean</p>
                        </div>
                        <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                          <div className="h-8 bg-muted mb-2 rounded"></div>
                          <div className="flex gap-2">
                            <div className="h-12 bg-muted rounded w-1/3"></div>
                            <div className="space-y-1 w-2/3">
                              <div className="h-3 bg-muted/70 rounded"></div>
                              <div className="h-3 bg-muted/70 rounded"></div>
                              <div className="h-3 bg-muted/70 rounded w-2/3"></div>
                            </div>
                          </div>
                          <p className="text-xs text-center mt-2">Classic & Elegant</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Typography</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                          <p className="font-sans text-lg font-bold">Aa</p>
                          <p className="text-xs text-center mt-1">Modern Sans</p>
                        </div>
                        <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                          <p className="font-serif text-lg font-bold">Aa</p>
                          <p className="text-xs text-center mt-1">Classic Serif</p>
                        </div>
                        <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                          <p className="font-mono text-lg font-bold">Aa</p>
                          <p className="text-xs text-center mt-1">Minimalist Mono</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Content & Features */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Step 3: Content & Features</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the content sections and features you want on your website
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Essential Sections</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "hero", name: "Hero Banner", defaultChecked: true },
                          { id: "about", name: "About Section", defaultChecked: true },
                          { id: "features", name: "Features Showcase", defaultChecked: true },
                          { id: "contact", name: "Contact Information", defaultChecked: true },
                        ].map((section) => (
                          <div key={section.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`section-${section.id}`}
                              defaultChecked={section.defaultChecked}
                              className="rounded text-primary focus:ring-primary"
                            />
                            <label htmlFor={`section-${section.id}`}>{section.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Features</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "gallery", name: "Image Gallery", defaultChecked: true },
                          { id: "testimonials", name: "Testimonials", defaultChecked: false },
                          { id: "map", name: "Interactive Map", defaultChecked: false },
                          { id: "social", name: "Social Media Links", defaultChecked: true },
                          { id: "blog", name: "Blog Section", defaultChecked: false },
                          { id: "newsletter", name: "Newsletter Signup", defaultChecked: false },
                          { id: "faq", name: "FAQ Section", defaultChecked: false },
                          { id: "calculator", name: "Mortgage Calculator", defaultChecked: false },
                        ].map((feature) => (
                          <div key={feature.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`feature-${feature.id}`}
                              defaultChecked={feature.defaultChecked}
                              className="rounded text-primary focus:ring-primary"
                            />
                            <label htmlFor={`feature-${feature.id}`}>{feature.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prompt">Additional Requirements</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe any specific content, features, or functionality you'd like to include..."
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Generate */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Step 4: Review & Generate</h3>
                    <p className="text-sm text-muted-foreground">
                      Review your selections and generate your custom website
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Website Name:</span>
                        <span>{websiteName || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Website Type:</span>
                        <span>
                          {websiteType === "landing"
                            ? "Landing Page"
                            : websiteType === "property-listing"
                              ? "Property Listings"
                              : websiteType === "blog"
                                ? "Real Estate Blog"
                                : "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Selected Features:</span>
                        <span>Multiple features selected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Custom Requirements:</span>
                        <span>{prompt ? "Provided" : "None"}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">AI-Powered Website Generation</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Our AI will use your selections to create a custom website tailored to your needs. The
                            generation process typically takes 15-30 seconds.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => changeStep(Math.max(currentStep - 1, 1))}>
                  Previous Step
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button
                  className={currentStep === 1 ? "ml-auto" : ""}
                  onClick={() => changeStep(Math.min(currentStep + 1, totalSteps))}
                  disabled={currentStep === 1 && !websiteName}
                >
                  Next Step
                </Button>
              ) : (
                <Button onClick={handleGenerate} disabled={isGenerating || !websiteName} className="gap-2">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Website
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Code Preview</CardTitle>
                <CardDescription>Generated code for your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopyCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleTabChange("custom")}>
                  Edit Prompt
                </Button>
              </CardFooter>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Visual Preview</CardTitle>
                <CardDescription>How your website will look</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {previewLoading ? (
                  <div className="bg-muted h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                      <p className="text-muted-foreground">Generating preview...</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-[400px] w-full border-t border-border">
                    <Image
                      src="/modern-property-website-preview.png"
                      alt="Website preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Open Full Preview
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleTabChange("deploy")}>
                  Continue to Deploy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Deploy Your Website</CardTitle>
                <CardDescription>Make your website live on the internet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <div className="flex gap-2">
                    <Input id="domain" placeholder="your-site" />
                    <Select defaultValue="vercel">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vercel">.vercel.app</SelectItem>
                        <SelectItem value="custom">Custom Domain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Deployment Options</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your website will be deployed to Vercel's global edge network for fast loading times worldwide.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Automatic HTTPS</span>
                    <span className="text-sm text-green-500">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Global CDN</span>
                    <span className="text-sm text-green-500">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analytics</span>
                    <span className="text-sm text-green-500">Included</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("preview")}>
                  Back to Preview
                </Button>
                <Button onClick={handleDeploy} disabled={deploymentStatus === "deploying"}>
                  {deploymentStatus === "deploying" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : deploymentStatus === "success" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Deployed
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Deploy Website
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Deployment Status</CardTitle>
                <CardDescription>Track your website deployment progress</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t border-border">
                  {deploymentStatus === "idle" ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                      <Globe className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Ready to Deploy</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Your website is ready to be deployed. Click the "Deploy Website" button to make it live.
                      </p>
                    </div>
                  ) : deploymentStatus === "deploying" ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                      <div className="relative mb-6">
                        <div className="h-24 w-24 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin"></div>
                        <Zap className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Deploying Your Website</h3>
                      <p className="text-muted-foreground mb-2">This usually takes 1-2 minutes</p>
                      <div className="w-full max-w-xs bg-muted h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                      <div className="bg-green-500/10 p-4 rounded-full mb-6">
                        <Check className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Deployment Successful!</h3>
                      <p className="text-muted-foreground mb-6">
                        Your website is now live and accessible at the URL below.
                      </p>
                      <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                        <code className="text-sm">https://your-site.vercel.app</code>
                        <Button size="sm" variant="ghost">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button className="mt-6" variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Website
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
