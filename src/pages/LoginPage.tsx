import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Group,
  Stack,
  Alert,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconHeartRateMonitor, IconAlertCircle, IconLock, IconUser } from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Already logged in — bounce to home
  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  const form = useForm({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (!v.trim() ? 'Username is required' : null),
      password: (v) => (!v ? 'Password is required' : null),
    },
  })

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true)
    setError('')
    try {
      await login(values.username, values.password)
      notifications.show({ message: 'Welcome back!', color: 'teal' })
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid username or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fafa 0%, #e6f7f7 50%, #f8fafa 100%)',
      }}
    >
      {/* Decorative blobs */}
      <Box
        style={{
          position: 'fixed', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5,171,171,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        style={{
          position: 'fixed', bottom: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5,171,171,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Box style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        {/* Logo */}
        <Stack align="center" mb={32} gap={6}>
          <Box
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #05abab, #009797)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(5,171,171,0.3)',
            }}
          >
            <IconHeartRateMonitor size={30} color="white" stroke={1.8} />
          </Box>
          <Text fw={700} size="xl" style={{ color: '#1a1a2e', letterSpacing: '-0.3px' }}>
            Medi<span style={{ color: '#05abab' }}>Care</span>
          </Text>
          <Text size="sm" c="dimmed">Patient Management System</Text>
        </Stack>

        <Card
          shadow="sm"
          p={32}
          radius="xl"
          style={{ border: '1px solid #e8f4f4', background: '#ffffff' }}
        >
          <Text fw={600} size="lg" mb={4} style={{ color: '#1a1a2e' }}>
            Admin Login
          </Text>
          <Text size="sm" c="dimmed" mb={24}>
            Sign in to access the dashboard
          </Text>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              mb={16}
              radius="md"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap={16}>
              <TextInput
                label="Username"
                placeholder="Enter your username"
                leftSection={<IconUser size={16} color="#05abab" />}
                {...form.getInputProps('username')}
                styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                leftSection={<IconLock size={16} color="#05abab" />}
                {...form.getInputProps('password')}
                styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
              />
              <Button
                type="submit"
                loading={loading}
                fullWidth
                mt={8}
                size="md"
                style={{
                  background: 'linear-gradient(135deg, #05abab, #009797)',
                  border: 'none',
                }}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Box
            mt={20}
            p={12}
            style={{
              background: '#f0fafa',
              borderRadius: 10,
              border: '1px solid #cdf2f2',
            }}
          >
            <Text size="xs" c="dimmed" fw={500}>Default credentials</Text>
            <Text size="xs" c="dimmed">Username: <b>admin</b> · Password: <b>admin123</b></Text>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
