import { useEffect, useState } from 'react'
import {
  Box, Card, Text, Group, SimpleGrid, Stack,
  ThemeIcon, Badge, Table, Skeleton, ScrollArea,
} from '@mantine/core'
import {
  IconUsers, IconStethoscope, IconCalendarClock,
  IconCalendarCheck, IconClockHour4, IconUserCheck,
} from '@tabler/icons-react'
import { dashboardApi, appointmentApi, DashboardStats, Appointment } from '../api/services'

const statusColors: Record<string, string> = {
  SCHEDULED: 'blue',
  CONFIRMED: 'teal',
  COMPLETED: 'green',
  CANCELLED: 'red',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingAppts, setLoadingAppts] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then((r) => setStats(r.data))
      .finally(() => setLoadingStats(false))

    appointmentApi.getAll()
      .then((r) => setAppointments(r.data.slice(0, 10)))
      .finally(() => setLoadingAppts(false))
  }, [])

  const statCards = [
    { label: 'Total Patients',         value: stats?.totalPatients,         icon: IconUsers,          color: 'teal' },
    { label: 'Total Doctors',          value: stats?.totalDoctors,          icon: IconStethoscope,    color: 'teal' },
    { label: 'Total Appointments',     value: stats?.totalAppointments,     icon: IconCalendarClock,  color: 'teal' },
    { label: 'Scheduled',              value: stats?.scheduledAppointments, icon: IconClockHour4,     color: 'teal' },
    { label: "Today's Appointments",   value: stats?.todayAppointments,     icon: IconCalendarCheck,  color: 'teal' },
    { label: 'Active Patients',        value: stats?.activePatients,        icon: IconUserCheck,      color: 'teal' },
  ]

  return (
    <Stack gap={24}>
      <Box>
        <Text fw={700} size="xl" style={{ color: '#1a1a2e' }}>Dashboard</Text>
        <Text size="sm" c="dimmed">System overview and recent activity</Text>
      </Box>

      {/* Stat cards */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 3 }} spacing="md">
        {statCards.map((card) => (
          <Card
            key={card.label}
            radius="lg"
            p={20}
            style={{ border: '1px solid #e8f4f4', background: '#fff' }}
          >
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text size="xs" c="dimmed" fw={500} mb={6}>
                  {card.label}
                </Text>
                {loadingStats
                  ? <Skeleton height={32} width={64} radius="md" />
                  : <Text fw={700} size="2rem" lh={1} style={{ color: '#1a1a2e' }}>
                      {card.value ?? 0}
                    </Text>
                }
              </Box>
              <ThemeIcon size={44} radius="md" color={card.color} variant="light">
                <card.icon size={22} stroke={1.8} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Recent appointments table */}
      <Card radius="lg" p={0} style={{ border: '1px solid #e8f4f4', background: '#fff' }}>
        <Box px={20} py={16} style={{ borderBottom: '1px solid #f0fafa' }}>
          <Text fw={600} size="md" style={{ color: '#1a1a2e' }}>
            Recent Appointments
          </Text>
          <Text size="xs" c="dimmed">Latest 10 appointments in the system</Text>
        </Box>

        <ScrollArea>
          <Table horizontalSpacing="lg" verticalSpacing="sm" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ background: '#f8fafa' }}>
                <Table.Th style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>#</Table.Th>
                <Table.Th style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>PATIENT</Table.Th>
                <Table.Th style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>DOCTOR</Table.Th>
                <Table.Th style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>DATE</Table.Th>
                <Table.Th style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>TIME</Table.Th>
                <Table.Th style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>STATUS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loadingAppts
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Table.Tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Table.Td key={j}><Skeleton height={16} radius="sm" /></Table.Td>
                      ))}
                    </Table.Tr>
                  ))
                : appointments.length === 0
                  ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text ta="center" c="dimmed" py={24} size="sm">
                          No appointments yet
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )
                  : appointments.map((a, idx) => (
                    <Table.Tr key={a.id}>
                      <Table.Td>
                        <Text size="sm" c="dimmed">{idx + 1}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>{a.patientName}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Box>
                          <Text size="sm" fw={500}>{a.doctorName}</Text>
                          <Text size="xs" c="dimmed">{a.doctorSpecialization}</Text>
                        </Box>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{a.appointmentDate}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{a.appointmentTime}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={statusColors[a.status] ?? 'gray'}
                          variant="light"
                          size="sm"
                          radius="sm"
                        >
                          {a.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
              }
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Stack>
  )
}
