import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton Component', () => {
  it('should render with default classes', () => {
    render(<Skeleton />)
    const skeletonElement = screen.getByTestId('skeleton')
    expect(skeletonElement).toBeInTheDocument()
    expect(skeletonElement).toHaveClass('animate-pulse rounded-md bg-muted')
  })

  it('should apply additional classes provided via props', () => {
    const testClass = 'custom-class'
    render(<Skeleton className={testClass} />)
    const skeletonElement = screen.getByTestId('skeleton')
    expect(skeletonElement).toHaveClass('animate-pulse rounded-md bg-muted', testClass)
  })

  it('should render with specific width and height classes', () => {
    render(<Skeleton className="h-10 w-48" />)
    const skeletonElement = screen.getByTestId('skeleton')
    expect(skeletonElement).toHaveClass('h-10 w-48')
  })
}) 