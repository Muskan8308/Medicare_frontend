import { useEffect, useState } from 'react'
import {
  Box, Card, Text, Group, Button, Select, Modal,
  Stack, Table, Badge, ActionIcon, Textarea,
  ScrollArea, Skeleton, Menu, TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { DateInput, TimeInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import {
  IconPlus, IconCalendarClock, IconDotsVertical,
  IconX, IconCheck, IconSearch,
} from '@tabler/icons-react'
import { appointmentApi, patientApi, doctorApi, Appointment, Patient, Doctor } from '../api/services'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'blue',
  CONFIRMED: 'teal',
  COMPLETED: 'green',
  CANCELLED: 'red',
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [bookOpened, { open: openBook, close: closeBook }] = useDisclosure(false)
  const [statusOpened, { open: openStatus, close: closeStatus }] = useDisclosure(false)
  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null)

  const form = useForm({
    initialValues: {
      patientId: '' as string | '',
      doctorId:  '' as string | '',
      appointmentDate: null as Date | null,
      appointmentTime: '',
      reason: '',
      notes: '',
    },
    validate: {
      patientId:       (v) => (!v ? 'Select a patient' : null),
      doctorId:        (v) => (!v ? 'Select a doctor' : null),
      appointmentDate: (v) => (!v ? 'Required' : null),
      appointmentTime: (v) => (!v ? 'Required' : null),
    },
  })

  const statusForm = useForm({
    initialValues: { status: '' as Appointment['status'] | '', notes: '' },
    validate: { status: (v) => (!v ? 'Select a status' : null) },
  })

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      appointmentApi.getAll(),
      patientApi.getAll(),
      doctorApi.getAll(),
    ]).then(([appts, pts, drs]) => {
      setAppointments(appts.data)
      setPatients(pts.data)
      setDoctors(drs.data)
    }).catch(() => notifications.show({ message: 'Failed to load data', color: 'red' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleBook = async (values: typeof form.values) => {
    if (!values.appointmentDate) return
    setSaving(true)
    try {
      await appointmentApi.book({
        patientId:       Number(values.patientId),
        doctorId:        Number(values.doctorId),
        appointmentDate: dayjs(values.appointmentDate).format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime,
        reason: values.reason || undefined,
        notes:  values.notes  || undefined,
      })
      notifications.show({ message: 'Appointment booked!', color: 'teal' })
      closeBook()
      form.reset()
      fetchAll()
    } catch (err: any) {
      notifications.show({
        message: err?.response?.data?.message ?? 'Booking failed',
        color: 'red',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (values: typeof statusForm.values) => {
    if (!activeAppt || !values.status) return
    setSaving(true)
    try {
      await appointmentApi.updateStatus(activeAppt.id, values.status, values.notes || undefined)
      notifications.show({ message: 'Status updated', color: 'teal' })
      closeStatus()
      fetchAll()
    } catch {
      notifications.show({ message: 'Failed to update status', color: 'red' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await appointmentApi.cancel(id)
      notifications.show({ message: 'Appointment cancelled', color: 'teal' })
      fetchAll()
    } catch (err: any) {
      notifications.show({
        message: err?.response?.data?.message ?? 'Failed to cancel',
        color: 'red',
      })
    }
  }

  const filtered = search
    ? appointments.filter(
        (a) =>
          a.patientName.toLowerCase().includes(search.toLowerCase()) ||
          a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
          a.status.toLowerCase().includes(search.toLowerCase())
      )
    : appointments

  const patientOptions = patients.map((p) => ({
    value: String(p.id),
    label: `${p.firstName} ${p.lastName}`,
  }))

  const doctorOptions = doctors.map((d) => ({
    value: String(d.id),
    label: `Dr. ${d.firstName} ${d.lastName} — ${d.specialization}`,
  }))

  return (
    <>
      <Stack gap={20}>
        <Group justify="space-between">
          <Box>
            <Text fw={700} size="xl" style={{ color: '#1a1a2e' }}>Appointments</Text>
            <Text size="sm" c="dimmed">Book and manage patient appointments</Text>
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openBook}
            style={{ background: 'linear-gradient(135deg, #05abab, #009797)', border: 'none' }}
          >
            Book Appointment
          </Button>
        </Group>

        <TextInput
          placeholder="Search by patient, doctor or status..."
          leftSection={<IconSearch size={16} color="#05abab" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: 380 }}
        />

        <Card radius="lg" p={0} style={{ border: '1px solid #e8f4f4', background: '#fff' }}>
          <ScrollArea>
            <Table horizontalSpacing="lg" verticalSpacing="sm" striped highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ background: '#f8fafa' }}>
                  {['Patient', 'Doctor', 'Specialization', 'Date', 'Time', 'Reason', 'Status', ''].map((h) => (
                    <Table.Th key={h} style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>{h}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Table.Tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <Table.Td key={j}><Skeleton height={16} radius="sm" /></Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  : filtered.length === 0
                    ? (
                      <Table.Tr>
                        <Table.Td colSpan={8}>
                          <Group justify="center" py={32} gap={8}>
                            <IconCalendarClock size={32} color="#d1d5db" stroke={1.5} />
                            <Text c="dimmed" size="sm">No appointments found</Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                    : filtered.map((a) => (
                      <Table.Tr key={a.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">{a.patientName}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{a.doctorName}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{a.doctorSpecialization}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{a.appointmentDate}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{a.appointmentTime}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed" lineClamp={1} maw={140}>
                            {a.reason || '—'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={STATUS_COLORS[a.status] ?? 'gray'}
                            variant="light"
                            size="sm"
                            radius="sm"
                          >
                            {a.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu shadow="sm" width={160} position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" radius="md">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconCheck size={14} />}
                                disabled={a.status === 'CANCELLED' || a.status === 'COMPLETED'}
                                onClick={() => {
                                  setActiveAppt(a)
                                  statusForm.setValues({ status: a.status, notes: a.notes ?? '' })
                                  openStatus()
                                }}
                              >
                                Update Status
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconX size={14} />}
                                color="red"
                                disabled={a.status === 'CANCELLED' || a.status === 'COMPLETED'}
                                onClick={() => handleCancel(a.id)}
                              >
                                Cancel
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))
                }
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      </Stack>

      {/* Book appointment modal */}
      <Modal
        opened={bookOpened}
        onClose={closeBook}
        title={<Text fw={600} size="lg" style={{ color: '#1a1a2e' }}>Book Appointment</Text>}
        size="md"
        radius="lg"
        centered
      >
        <form onSubmit={form.onSubmit(handleBook)}>
          <Stack gap={14}>
            <Select
              label="Patient"
              placeholder="Select patient"
              data={patientOptions}
              searchable
              {...form.getInputProps('patientId')}
            />
            <Select
              label="Doctor"
              placeholder="Select doctor"
              data={doctorOptions}
              searchable
              {...form.getInputProps('doctorId')}
            />
            <Group grow>
              <DateInput
                label="Date"
                placeholder="Pick a date"
                minDate={new Date()}
                valueFormat="YYYY-MM-DD"
                {...form.getInputProps('appointmentDate')}
              />
              <TimeInput
                label="Time"
                placeholder="09:00"
                {...form.getInputProps('appointmentTime')}
              />
            </Group>
            <TextInput
              label="Reason"
              placeholder="Purpose of visit (optional)"
              {...form.getInputProps('reason')}
            />
            <Textarea
              label="Notes"
              placeholder="Additional notes (optional)"
              rows={2}
              {...form.getInputProps('notes')}
            />
            <Group justify="flex-end" mt={8}>
              <Button variant="default" onClick={closeBook} radius="md">Cancel</Button>
              <Button
                type="submit"
                loading={saving}
                radius="md"
                style={{ background: 'linear-gradient(135deg, #05abab, #009797)', border: 'none' }}
              >
                Book Appointment
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Update status modal */}
      <Modal
        opened={statusOpened}
        onClose={closeStatus}
        title={<Text fw={600} size="lg" style={{ color: '#1a1a2e' }}>Update Status</Text>}
        size="sm"
        radius="lg"
        centered
      >
        <form onSubmit={statusForm.onSubmit(handleStatusUpdate)}>
          <Stack gap={14}>
            <Text size="sm" c="dimmed">
              Appointment for <b>{activeAppt?.patientName}</b> with <b>{activeAppt?.doctorName}</b>
            </Text>
            <Select
              label="New Status"
              data={['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']}
              {...statusForm.getInputProps('status')}
            />
            <Textarea
              label="Notes"
              placeholder="Optional notes..."
              rows={2}
              {...statusForm.getInputProps('notes')}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={closeStatus} radius="md">Cancel</Button>
              <Button
                type="submit"
                loading={saving}
                radius="md"
                style={{ background: 'linear-gradient(135deg, #05abab, #009797)', border: 'none' }}
              >
                Update
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}
