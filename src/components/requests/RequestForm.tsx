import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RequestType } from '@shared/types';
import { FileUpload } from '../ui/file-upload';
const requestTypes: RequestType[] = ['Name', 'DOB', 'Address', 'Phone', 'Photo', 'LGA'];
const formSchema = z.object({
  nin: z.string().regex(/^\d{11}$/, "NIN must be 11 digits"),
  fullName: z.string().min(3, "Full name is required"),
  requestType: z.enum(requestTypes),
  submittedAt: z.date().optional(),
  oldValue: z.union([z.string(), z.date()]).optional(),
  newValue: z.union([z.string().min(1, "New value is required"), z.date({ required_error: "New value is required" })]),
  reason: z.string().min(10, "A detailed reason is required"),
  documents: z.array(z.instanceof(File)).optional(),
});
export type RequestFormValues = z.infer<typeof formSchema>;
interface RequestFormProps {
  onSubmit: (data: RequestFormValues) => void;
  isSubmitting: boolean;
}
export function RequestForm({ onSubmit, isSubmitting }: RequestFormProps) {
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nin: '',
      fullName: '',
      requestType: 'Name',
      submittedAt: new Date(),
      oldValue: '',
      newValue: '',
      reason: '',
      documents: [],
    },
    onError: (errors) => console.log('Form validation errors:', errors),
  });
  const selectedType = form.watch('requestType');
  const renderValueFields = () => {
    switch (selectedType) {
      case 'DOB':
        return (
          <>
            <FormField
              control={form.control}
              name="oldValue"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Old Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newValue"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>New Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'Address':
        return (
          <>
            <FormField control={form.control} name="oldValue" render={({ field }) => (
              <FormItem><FormLabel>Old Address</FormLabel><FormControl><Textarea placeholder="Enter old address" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="newValue" render={({ field }) => (
              <FormItem><FormLabel>New Address</FormLabel><FormControl><Textarea placeholder="Enter new address" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        );
      default:
        return (
          <>
            <FormField control={form.control} name="oldValue" render={({ field }) => (
              <FormItem><FormLabel>Old Value</FormLabel><FormControl><Input placeholder="Enter old value" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="newValue" render={({ field }) => (
              <FormItem><FormLabel>New Value</FormLabel><FormControl><Input placeholder="Enter new value" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        );
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a New Request</CardTitle>
        <CardDescription>Fill in the details below to create a new modification request.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="nin" render={({ field }) => (
                <FormItem><FormLabel>NIN</FormLabel><FormControl><Input placeholder="11-digit NIN" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Applicant's full name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('oldValue', '');
                      form.setValue('newValue', '');
                    }} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a request type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {requestTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="submittedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Submission Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderValueFields()}
            </div>
            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem><FormLabel>Reason for Change</FormLabel><FormControl><Textarea placeholder="Provide a detailed reason for this modification request..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField
              control={form.control}
              name="documents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supporting Documents</FormLabel>
                  <FormControl>
                    <FileUpload onFilesChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}