"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Eye, EyeOff } from "lucide-react"

export default function ComponentsPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <h1 className="mb-8 text-4xl font-bold">Components</h1>

        {/* Inputs Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Inputs</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Text Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text Input</Label>
                  <Input
                    id="text-input"
                    type="text"
                    placeholder="Enter text"
                    data-testid="cmp-input-text"
                  />
                  <p className="text-sm text-muted-foreground">Helper text goes here</p>
                </div>
              </CardContent>
            </Card>

            {/* Textarea */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="textarea">Textarea</Label>
                  <Textarea
                    id="textarea"
                    placeholder="Enter multiple lines"
                    data-testid="cmp-input-textarea"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    data-testid="cmp-input-email"
                  />
                </div>
              </CardContent>
            </Card>

            {/* URL Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    data-testid="cmp-input-url"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      data-testid="cmp-input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      data-testid="cmp-input-password-toggle"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Number Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="number">Number</Label>
                  <Input
                    id="number"
                    type="number"
                    placeholder="42"
                    data-testid="cmp-input-number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Select */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="select">Select</Label>
                  <Select>
                    <SelectTrigger id="select" data-testid="cmp-input-select">
                      <SelectValue placeholder="Choose option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Checkbox */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label>Checkbox</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="checkbox1" data-testid="cmp-input-checkbox" />
                    <Label htmlFor="checkbox1" className="font-normal">
                      Accept terms
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="checkbox2" />
                    <Label htmlFor="checkbox2" className="font-normal">
                      Subscribe to newsletter
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radio Group */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Radio Group</Label>
                  <RadioGroup defaultValue="option1" data-testid="cmp-input-radio">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="radio1" />
                      <Label htmlFor="radio1" className="font-normal">
                        Option 1
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="radio2" />
                      <Label htmlFor="radio2" className="font-normal">
                        Option 2
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Switch */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label>Switch</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch1" data-testid="cmp-input-switch" />
                    <Label htmlFor="switch1" className="font-normal">
                      Enable notifications
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    data-testid="cmp-input-date"
                  />
                </div>
              </CardContent>
            </Card>

            {/* DateTime Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="datetime">DateTime</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    data-testid="cmp-input-datetime"
                  />
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Alerts Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Alerts</h2>
          <div className="grid gap-6 md:grid-cols-2">

            <Alert variant="destructive" data-testid="cmp-alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error: Something went wrong with your submission.
              </AlertDescription>
            </Alert>

            <Alert className="border-green-500 text-green-700 [&>svg]:text-green-600" data-testid="cmp-alert-success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Success: Your changes have been saved.
              </AlertDescription>
            </Alert>

            <Alert className="border-amber-500 text-amber-700 [&>svg]:text-amber-600" data-testid="cmp-alert-warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Your session will expire soon.
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-500 text-blue-700 [&>svg]:text-blue-600" data-testid="cmp-alert-info">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Info: New features are available.
              </AlertDescription>
            </Alert>

          </div>
        </section>

        {/* Toasts Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Toasts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="destructive"
                  onClick={() => toast.error("This is an error toast")}
                  data-testid="cmp-toast-trigger-error"
                  className="w-full"
                >
                  Show Error Toast
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => toast.success("This is a success toast")}
                  data-testid="cmp-toast-trigger-success"
                >
                  Show Success Toast
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => toast.warning("This is a warning toast")}
                  data-testid="cmp-toast-trigger-warning"
                >
                  Show Warning Toast
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => toast.info("This is an info toast")}
                  data-testid="cmp-toast-trigger-info"
                >
                  Show Info Toast
                </Button>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Button Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Buttons</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Primary Button</Label>
                  <Button data-testid="ui-button" className="w-full">
                    Primary
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Secondary Button</Label>
                  <Button variant="outline" className="w-full">
                    Secondary
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Ghost Button</Label>
                  <Button variant="ghost" className="w-full">
                    Ghost
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Destructive Button</Label>
                  <Button variant="destructive" className="w-full">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Disabled Button</Label>
                  <Button disabled className="w-full">
                    Disabled
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Card Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Card</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            <Card data-testid="ui-card">
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a card component with header and content.
                </p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Table Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Tables</h2>

          {/* Info List Style Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Info List Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-testid="cmp-table-infolist">
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Name</TableCell>
                    <TableCell>John Doe</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell>john@example.com</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Role</TableCell>
                    <TableCell>Administrator</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Standard Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Standard Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>john@example.com</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>jane@example.com</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bob Johnson</TableCell>
                    <TableCell>bob@example.com</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Inactive</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Pagination Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Pagination</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2" data-testid="cmp-pagination">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  )
}
