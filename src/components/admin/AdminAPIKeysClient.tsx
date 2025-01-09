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

export default function AdminAPIKeysClient() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">API Keys Management</h2>
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
          {apiKeys.map((apiKey) => (
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
  )
}