import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, Text, Group, SimpleGrid, Stack,
  ThemeIcon, Button, Skeleton,
} from '@mantine/core'
import {
  IconUsers, IconStethoscope, IconCalendarClock,
  IconLayoutDashboard, IconArrowRight, IconHeartHandshake,
  IconClipboardList, IconCalendarCheck,
} from '@tabler/icons-react'
import { dashboardApi, DashboardStats } from '../api/services'
import { useAuth } from '../hooks/useAuth'

const quickLinks = [
  {
    label: 'Register Patient',
    description: 'Add a new patient to the system',
    icon: IconUsers,
    path: '/patients',
    color: '#05abab',
    bg: '#e6fafa',
  },
  {
    label: 'View Doctors',
    description: 'Browse and manage doctor profiles',
    icon: IconStethoscope,
    path: '/doctors',
    color: '#05abab',
    bg: '#e6fafa',
  },
  {
    label: 'Book Appointment',
    description: 'Schedule a new appointment',
    icon: IconCalendarClock,
    path: '/appointments',
    color: '#05abab',
    bg: '#e6fafa',
  },
  {
    label: 'Dashboard',
    description: 'View analytics and reports',
    icon: IconLayoutDashboard,
    path: '/dashboard',
    color: '#05abab',
    bg: '#e6fafa',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { username } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Stack gap={28}>
      {/* Hero welcome */}
      <Card
        radius="xl"
        p={32}
        style={{
          background: 'linear-gradient(135deg, #05abab 0%, #009797 100%)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <Box style={{
          position: 'absolute', right: 60, bottom: -60,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />

        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap={10} mb={8}>
              <IconHeartHandshake size={28} color="rgba(255,255,255,0.9)" stroke={1.6} />
              <Text fw={700} size="xl" c="white">
                Welcome back, {username}
              </Text>
            </Group>
            <Text c="rgba(255,255,255,0.8)" size="sm" maw={480}>
              MediCare Patient Management System — manage patients, appointments,
              and doctors all in one place.
            </Text>
            <Group mt={20} gap={12}>
              <Button
                variant="white"
                color="teal"
                size="sm"
                radius="md"
                rightSection={<IconArrowRight size={14} />}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                color="white"
                size="sm"
                radius="md"
                onClick={() => navigate('/appointments')}
                styles={{ root: { color: 'white', borderColor: 'rgba(255,255,255,0.5)' } }}
              >
                Book Appointment
              </Button>
            </Group>
          </Box>
        </Group>
      </Card>

      {/* Mini stats */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 3 }} spacing="md">
        {[
          { label: "Today's Appointments", value: stats?.todayAppointments, icon: IconCalendarCheck },
          { label: 'Total Patients', value: stats?.totalPatients, icon: IconUsers },
          { label: 'Total Doctors', value: stats?.totalDoctors, icon: IconStethoscope },
        ].map((item) => (
          <Card
            key={item.label}
            radius="lg"
            p={20}
            style={{ border: '1px solid #e8f4f4', background: '#fff' }}
          >
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="dimmed" fw={500} mb={4}>{item.label}</Text>
                {loading
                  ? <Skeleton height={28} width={60} radius="md" />
                  : <Text fw={700} size="xl" style={{ color: '#1a1a2e' }}>
                      {item.value ?? '—'}
                    </Text>
                }
              </Box>
              <ThemeIcon size={40} radius="md" color="teal" variant="light">
                <item.icon size={20} stroke={1.8} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick links */}
      <Box>
        <Text fw={600} size="md" mb={16} style={{ color: '#1a1a2e' }}>
          Quick Actions
        </Text>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          {quickLinks.map((link) => (
            <Card
              key={link.label}
              radius="lg"
              p={20}
              style={{
                border: '1px solid #e8f4f4',
                background: '#fff',
                cursor: 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
              }}
              onClick={() => navigate(link.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(5,171,171,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <ThemeIcon
                size={44}
                radius="md"
                color="teal"
                variant="light"
                mb={14}
              >
                <link.icon size={22} stroke={1.8} />
              </ThemeIcon>
              <Text fw={600} size="sm" mb={4} style={{ color: '#1a1a2e' }}>
                {link.label}
              </Text>
              <Text size="xs" c="dimmed">{link.description}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Info strip */}
      <Card
        radius="lg"
        p={20}
        style={{ border: '1px solid #e8f4f4', background: '#fff' }}
      >
        <Group gap={12}>
          <ThemeIcon size={36} radius="md" color="teal" variant="light">
            <IconClipboardList size={18} stroke={1.8} />
          </ThemeIcon>
          <Box>
            <Text fw={500} size="sm" style={{ color: '#1a1a2e' }}>
              Getting Started
            </Text>
            <Text size="xs" c="dimmed">
              Start by adding doctors → registering patients → then book appointments.
              Use the Dashboard to track activity across the system.
            </Text>
          </Box>
        </Group>
      </Card>
    </Stack>
  )
}
