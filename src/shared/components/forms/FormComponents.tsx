/**
 * Reusable Form Components
 * Provides consistent form elements with validation and accessibility
 */

import React from 'react'
import { useFormContext, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '@/core/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

// Form field wrapper props
export interface FormFieldProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Form field wrapper with label and error handling
 */
export function FormField<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  className,
  children,
}: FormFieldProps<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>()

  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  )
}

// Input field props
export interface FormInputProps<T extends FieldValues = FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
}

/**
 * Form input field with validation
 */
export function FormInput<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  className,
  ...props
}: FormInputProps<T>) {
  const { register } = useFormContext<T>()

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <Input
        id={name}
        className={className}
        {...register(name)}
        {...props}
      />
    </FormField>
  )
}

// Password input props
export interface FormPasswordProps<T extends FieldValues = FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  showToggle?: boolean
}

/**
 * Form password field with show/hide toggle
 */
export function FormPassword<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  showToggle = true,
  className,
  ...props
}: FormPasswordProps<T>) {
  const [showPassword, setShowPassword] = React.useState(false)
  const { register } = useFormContext<T>()

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <div className="relative">
        <Input
          id={name}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...register(name)}
          {...props}
        />
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </FormField>
  )
}

// Textarea props
export interface FormTextareaProps<T extends FieldValues = FieldValues>
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
}

/**
 * Form textarea field with validation
 */
export function FormTextarea<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  className,
  ...props
}: FormTextareaProps<T>) {
  const { register } = useFormContext<T>()

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <Textarea
        id={name}
        className={className}
        {...register(name)}
        {...props}
      />
    </FormField>
  )
}

// Select option
export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

// Select props
export interface FormSelectProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  options: SelectOption[]
  className?: string
}

/**
 * Form select field with validation
 */
export function FormSelect<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  placeholder,
  options,
  className,
}: FormSelectProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  )
}

// Checkbox props
export interface FormCheckboxProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  className?: string
}

/**
 * Form checkbox field with validation
 */
export function FormCheckbox<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  className,
}: FormCheckboxProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} description={description} required={required} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            {label && (
              <Label
                htmlFor={name}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
          </div>
        )}
      />
    </FormField>
  )
}

// Radio option
export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
}

// Radio group props
export interface FormRadioGroupProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  options: RadioOption[]
  className?: string
}

/**
 * Form radio group field with validation
 */
export function FormRadioGroup<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  options,
  className,
}: FormRadioGroupProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className={className}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  disabled={option.disabled}
                />
                <Label
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
    </FormField>
  )
}

// Switch props
export interface FormSwitchProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  className?: string
}

/**
 * Form switch field with validation
 */
export function FormSwitch<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  className,
}: FormSwitchProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} description={description} required={required} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            {label && (
              <Label htmlFor={name} className="text-sm font-normal">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
          </div>
        )}
      />
    </FormField>
  )
}

// Form section props
export interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

/**
 * Form section with title and description
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

// Form actions props
export interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

/**
 * Form actions container
 */
export function FormActions({
  children,
  className,
  align = 'right',
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        {
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
        },
        className
      )}
    >
      {children}
    </div>
  )
}
