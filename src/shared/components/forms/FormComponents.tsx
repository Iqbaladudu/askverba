/**
 * Reusable Form Components
 * Provides consistent form elements with validation and accessibility
 */

import React from 'react'
import { useFormContext, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
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
  const errorMessage = error?.message as string

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Text input field
 */
export interface FormInputProps<T extends FieldValues = FieldValues> extends FormFieldProps<T> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  autoComplete?: string
  showPasswordToggle?: boolean
}

export function FormInput<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  type = 'text',
  placeholder,
  disabled,
  autoComplete,
  showPasswordToggle,
  className,
}: FormInputProps<T>) {
  const { control } = useFormContext<T>()
  const [showPassword, setShowPassword] = React.useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <FormField name={name} label={label} description={description} required={required} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <Input
              {...field}
              id={name}
              type={inputType}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              className={cn(
                type === 'password' && showPasswordToggle && 'pr-10'
              )}
            />
            {type === 'password' && showPasswordToggle && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            )}
          </div>
        )}
      />
    </FormField>
  )
}

/**
 * Textarea field
 */
export interface FormTextareaProps<T extends FieldValues = FieldValues> extends FormFieldProps<T> {
  placeholder?: string
  disabled?: boolean
  rows?: number
  maxLength?: number
}

export function FormTextarea<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  placeholder,
  disabled,
  rows = 3,
  maxLength,
  className,
}: FormTextareaProps<T>) {
  const { control, watch } = useFormContext<T>()
  const value = watch(name) as string

  return (
    <FormField name={name} label={label} description={description} required={required} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Textarea
              {...field}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
            />
            {maxLength && (
              <div className="text-right text-xs text-muted-foreground">
                {(value?.length || 0)}/{maxLength}
              </div>
            )}
          </div>
        )}
      />
    </FormField>
  )
}

/**
 * Select field
 */
export interface FormSelectProps<T extends FieldValues = FieldValues> extends FormFieldProps<T> {
  placeholder?: string
  disabled?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export function FormSelect<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  placeholder = 'Select an option',
  disabled,
  options,
  className,
}: FormSelectProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} label={label} description={description} required={required} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={name}>
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

/**
 * Checkbox field
 */
export interface FormCheckboxProps<T extends FieldValues = FieldValues> extends FormFieldProps<T> {
  disabled?: boolean
}

export function FormCheckbox<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  disabled,
  className,
}: FormCheckboxProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} description={description} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <Label
                htmlFor={name}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </Label>
            )}
          </div>
        )}
      />
    </FormField>
  )
}

/**
 * Radio group field
 */
export interface FormRadioGroupProps<T extends FieldValues = FieldValues> extends FormFieldProps<T> {
  disabled?: boolean
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>
  orientation?: 'horizontal' | 'vertical'
}

export function FormRadioGroup<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  disabled,
  options,
  orientation = 'vertical',
  className,
}: FormRadioGroupProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} label={label} description={description} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
            className={cn(
              orientation === 'horizontal' && 'flex flex-wrap gap-6'
            )}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  disabled={option.disabled}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      />
    </FormField>
  )
}

/**
 * Switch field
 */
export interface FormSwitchProps<T extends FieldValues = FieldValues> extends FormFieldProps<T> {
  disabled?: boolean
}

export function FormSwitch<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  disabled,
  className,
}: FormSwitchProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField name={name} description={description} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {label && (
                <Label htmlFor={name} className="text-sm font-normal">
                  {label}
                </Label>
              )}
            </div>
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </div>
        )}
      />
    </FormField>
  )
}

/**
 * Form section component
 */
export interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-medium leading-none">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

/**
 * Form actions component
 */
export interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function FormActions({
  children,
  className,
  align = 'right',
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
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

// Export all form components
export default {
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormSwitch,
  FormSection,
  FormActions,
}
