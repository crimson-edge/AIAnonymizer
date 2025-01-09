"use client"

import { useEffect, useState } from "react"
import { ApiKey } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { formatDate } from "@/lib/auth/utils"

const ITEMS_PER_PAGE = 10

export default function AdminAPIKeysClient() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys')
      if (!response.ok) throw new Error('Failed to fetch API keys')
      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast.error('Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    const key = window.prompt('Enter the API key:')
    if (!key) return // User cancelled or entered empty string
    
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      })
      if (!response.ok) throw new Error('Failed to create API key')
      toast.success('API key created successfully')
      fetchApiKeys()
    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Failed to create API key')
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) throw new Error('Failed to delete API key')
      
      toast.success('API key deleted successfully')
      fetchApiKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  // Pagination logic
  const totalPages = Math.ceil(apiKeys.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentKeys = apiKeys.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Keys Management</h2>
        <Button onClick={createApiKey}>
          Add New API Key
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Usage</TableHead>
              <TableHead>Total Tokens</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell className="font-mono">{apiKey.key}</TableCell>
                <TableCell>{apiKey.status}</TableCell>
                <TableCell>{apiKey.totalUsage}</TableCell>
                <TableCell>{apiKey.totalTokensUsed}</TableCell>
                <TableCell>{apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}</TableCell>
                <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this API key?')) {
                        deleteApiKey(apiKey.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}