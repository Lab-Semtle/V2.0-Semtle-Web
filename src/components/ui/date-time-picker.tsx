"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
    date?: Date
    onDateChange?: (date: Date | undefined) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    required?: boolean
    id?: string
    name?: string
    showTime?: boolean
}

export function DateTimePicker({
    date,
    onDateChange,
    placeholder = "날짜와 시간을 선택하세요",
    className,
    disabled = false,
    required = false,
    id,
    name,
    showTime = true,
}: DateTimePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
    const [timeValue, setTimeValue] = React.useState<string>(
        date ? format(date, "HH:mm") : ""
    )

    React.useEffect(() => {
        setSelectedDate(date)
        if (date && showTime) {
            setTimeValue(format(date, "HH:mm"))
        }
    }, [date, showTime])

    const handleDateSelect = (selected: Date | undefined) => {
        setSelectedDate(selected)

        if (showTime) {
            if (selected && timeValue) {
                // 시간 값 파싱
                const [hours, minutes] = timeValue.split(":").map(Number)
                const newDateTime = new Date(selected)
                newDateTime.setHours(hours || 0, minutes || 0, 0, 0)
                onDateChange?.(newDateTime)
            } else if (selected) {
                // 날짜만 선택된 경우, 현재 시간 사용
                const newDateTime = new Date(selected)
                newDateTime.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0)
                setTimeValue(format(newDateTime, "HH:mm"))
                onDateChange?.(newDateTime)
            } else {
                onDateChange?.(undefined)
            }
        } else {
            // 시간 없이 날짜만
            if (selected) {
                const newDate = new Date(selected)
                newDate.setHours(0, 0, 0, 0)
                onDateChange?.(newDate)
            } else {
                onDateChange?.(undefined)
            }
        }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        setTimeValue(value)

        if (selectedDate && value) {
            const [hours, minutes] = value.split(":").map(Number)
            if (!isNaN(hours) && !isNaN(minutes)) {
                const newDateTime = new Date(selectedDate)
                newDateTime.setHours(hours, minutes, 0, 0)
                onDateChange?.(newDateTime)
            }
        } else if (selectedDate) {
            // 시간이 선택되지 않은 경우
            const newDateTime = new Date(selectedDate)
            newDateTime.setHours(0, 0, 0, 0)
            onDateChange?.(newDateTime)
        }
    }

    // 폼 제출을 위한 숨겨진 input
    const hiddenInputValue = showTime && selectedDate && timeValue
        ? (() => {
            const [hours, minutes] = timeValue.split(":").map(Number)
            const dateTime = new Date(selectedDate)
            dateTime.setHours(hours || 0, minutes || 0, 0, 0)
            return format(dateTime, "yyyy-MM-dd'T'HH:mm")
        })()
        : selectedDate
            ? format(selectedDate, "yyyy-MM-dd")
            : ""

    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const [popoverWidth, setPopoverWidth] = React.useState<number>(280)
    const [minPopoverWidth, setMinPopoverWidth] = React.useState<number>(280)
    const isInitialWidthSet = React.useRef(false)

    React.useEffect(() => {
        const updateWidth = () => {
            if (buttonRef.current) {
                const width = buttonRef.current.offsetWidth
                setPopoverWidth(width)

                // 처음으로 충분히 큰 크기를 측정했을 때 최소값으로 설정
                if (!isInitialWidthSet.current && width >= 280) {
                    setMinPopoverWidth(width)
                    isInitialWidthSet.current = true
                }
            }
        }

        updateWidth()

        // ResizeObserver로 버튼 크기 변경 감지
        if (buttonRef.current) {
            const resizeObserver = new ResizeObserver(updateWidth)
            resizeObserver.observe(buttonRef.current)

            return () => {
                resizeObserver.disconnect()
            }
        }
    }, [])

    // 시간 옵션 생성 (15분 단위)
    const timeOptions = React.useMemo(() => {
        const options: string[] = []
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const h = hour.toString().padStart(2, '0')
                const m = minute.toString().padStart(2, '0')
                options.push(`${h}:${m}`)
            }
        }
        return options
    }, [])

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        ref={buttonRef}
                        variant="outline"
                        data-empty={!selectedDate}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            "data-[empty=true]:text-muted-foreground",
                            "transition-all duration-150",
                            !selectedDate
                                ? "bg-slate-50/50 border-slate-200 hover:bg-slate-50/70"
                                : "bg-white border-slate-200 hover:bg-white",
                            className
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                            format(selectedDate, "PPP", { locale: ko })
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 shadow-lg border-slate-200/80 bg-white/95 backdrop-blur-sm"
                    align="start"
                    sideOffset={8}
                    style={{
                        width: `${Math.max(popoverWidth, minPopoverWidth)}px`,
                        minWidth: `${minPopoverWidth}px`
                    } as React.CSSProperties}
                >
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={2100}
                        className="rounded-lg w-full"
                    />
                </PopoverContent>
            </Popover>

            {showTime && (
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                    <select
                        value={timeValue}
                        onChange={handleTimeChange}
                        disabled={disabled}
                        className={cn(
                            "w-full text-sm border rounded-md pl-10 pr-3 py-2 text-slate-900 appearance-none bg-no-repeat bg-right cursor-pointer transition-all duration-150",
                            "bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')]",
                            "focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 focus:outline-none",
                            !timeValue
                                ? "bg-slate-50/50 border-slate-200 hover:bg-slate-50/70"
                                : "bg-white border-slate-200 hover:bg-white"
                        )}
                    >
                        <option value="">시간 선택</option>
                        {timeOptions.map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* 폼 제출을 위한 숨겨진 input */}
            <input
                type="hidden"
                id={id}
                name={name}
                value={hiddenInputValue}
                required={required}
            />
        </div>
    )
}

