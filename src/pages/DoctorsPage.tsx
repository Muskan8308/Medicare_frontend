import { useEffect, useState } from 'react'
import {
  Box, Card, Text, Group, Button, TextInput, Select,
  SimpleGrid, Badge, ActionIcon, Modal, Stack, Textarea,
  NumberInput, Skeleton, Menu, ThemeIcon,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import {
  IconPlus, IconSearch, IconEdit, IconTrash,
  IconStethoscope, IconDotsVertical, IconPhone,
  IconMail, IconStar,
} from '@tabler/icons-react'
import { doctorApi, Doctor } from '../api/services'

const SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics',
  'Dermatology', 'Gynecology', 'Oncology', 'Ophthalmology',
  'Psychiatry', 'Radiology', 'General Medicine', 'ENT',
]

const statusColors: Record<string, string> = {
  AVAILABLE: 'green',
  UNAVAILABLE: 'gray',
  ON_LEAVE: 'orange',
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)

  const form = useForm({
    initialValues: {
      firstName: '', lastName: '', specialization: '', email: '',
      phone: '', qualification: '', experienceYears: undefined as number | undefined,
      consultationFee: undefined as number | undefined, bio: '', availableDays: '',
    },
    validate: {
      firstName:      (v) => (!v.trim() ? 'Required' : null),
      lastName:       (v) => (!v.trim() ? 'Required' : null),
      specialization: (v) => (!v ? 'Required' : null),
      email:          (v) => (!/\S+@\S+\.\S+/.test(v) ? 'Valid email required' : null),
      phone:          (v) => (!v.trim() ? 'Required' : null),
    },
  })

  const fetchDoctors = (q?: string) => {
    setLoading(true)
    doctorApi.getAll(q)
      .then((r) => setDoctors(r.data))
      .catch(() => notifications.show({ message: 'Failed to load doctors', color: 'red' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDoctors() }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchDoctors(search || undefined), 350)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => {
    setEditing(null)
    form.reset()
    openModal()
  }

  const openEdit = (d: Doctor) => {
    setEditing(d)
    form.setValues({
      firstName:      d.firstName,
      lastName:       d.lastName,
      specialization: d.specialization,
      email:          d.email,
      phone:          d.phone,
      qualification:  d.qualification ?? '',
      experienceYears: d.experienceYears,
      consultationFee: d.consultationFee,
      bio:            d.bio ?? '',
      availableDays:  d.availableDays ?? '',
    })
    openModal()
  }

  const handleSubmit = async (values: typeof form.values) => {
    setSaving(true)
    try {
      if (editing) {
        await doctorApi.update(editing.id, values as any)
        notifications.show({ message: 'Doctor updated', color: 'teal' })
      } else {
        await doctorApi.create(values as any)
        notifications.show({ message: 'Doctor added', color: 'teal' })
      }
      closeModal()
      fetchDoctors()
    } catch (err: any) {
      notifications.show({
        message: err?.response?.data?.message ?? 'Something went wrong',
        color: 'red',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await doctorApi.delete(deleteTarget.id)
      notifications.show({ message: 'Doctor removed', color: 'teal' })
      closeDelete()
      fetchDoctors()
    } catch {
      notifications.show({ message: 'Failed to delete doctor', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap={20}>
        <Group justify="space-between">
          <Box>
            <Text fw={700} size="xl" style={{ color: '#1a1a2e' }}>Doctors</Text>
            <Text size="sm" c="dimmed">Browse and manage doctor profiles</Text>
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openAdd}
            style={{ background: 'linear-gradient(135deg, #05abab, #009797)', border: 'none' }}
          >
            Add Doctor
          </Button>
        </Group>

        <TextInput
          placeholder="Search by name or specialization..."
          leftSection={<IconSearch size={16} color="#05abab" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: 380 }}
        />

        {loading
          ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={200} radius="lg" />
              ))}
            </SimpleGrid>
          )
          : doctors.length === 0
            ? (
              <Card radius="lg" p={40} style={{ border: '1px solid #e8f4f4', background: '#fff' }}>
                <Group justify="center" gap={8}>
                  <IconStethoscope size={36} color="#d1d5db" stroke={1.5} />
                  <Text c="dimmed">No doctors found</Text>
                </Group>
              </Card>
            )
            : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {doctors.map((d) => (
                  <Card
                    key={d.id}
                    radius="lg"
                    p={20}
                    style={{ border: '1px solid #e8f4f4', background: '#fff' }}
                  >
                    <Group justify="space-between" mb={12}>
                      <Group gap={12}>
                        <ThemeIcon size={44} radius="xl" color="teal" variant="light">
                          <IconStethoscope size={20} stroke={1.8} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={600} size="sm" style={{ color: '#1a1a2e' }}>
                            Dr. {d.firstName} {d.lastName}
                          </Text>
                          <Badge
                            size="xs"
                            variant="light"
                            color="teal"
                            radius="sm"
                          >
                            {d.specialization}
                          </Badge>
                        </Box>
                      </Group>
                      <Menu shadow="sm" width={140} position="bottom-end">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" radius="md">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => openEdit(d)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => { setDeleteTarget(d); openDelete() }}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Stack gap={6}>
                      {d.qualification && (
                        <Group gap={6}>
                          <IconStar size={13} color="#05abab" />
                          <Text size="xs" c="dimmed">{d.qualification}</Text>
                        </Group>
                      )}
                      <Group gap={6}>
                        <IconPhone size={13} color="#05abab" />
                        <Text size="xs" c="dimmed">{d.phone}</Text>
                      </Group>
                      <Group gap={6}>
                        <IconMail size={13} color="#05abab" />
                        <Text size="xs" c="dimmed">{d.email}</Text>
                      </Group>
                    </Stack>

                    <Group justify="space-between" mt={14}>
                      {d.experienceYears != null && (
                        <Text size="xs" c="dimmed">
                          <b style={{ color: '#05abab' }}>{d.experienceYears} yrs</b> exp.
                        </Text>
                      )}
                      {d.consultationFee != null && (
                        <Text size="xs" c="dimmed">
                          Fee: <b style={{ color: '#1a1a2e' }}>₹{d.consultationFee}</b>
                        </Text>
                      )}
                      <Badge
                        size="xs"
                        variant="light"
                        color={statusColors[d.status] ?? 'gray'}
                        radius="sm"
                      >
                        {d.status.replace('_', ' ')}
                      </Badge>
                    </Group>

                    {d.availableDays && (
                      <Text size="xs" c="dimmed" mt={8}>
                        📅 {d.availableDays}
                      </Text>
                    )}
                  </Card>
                ))}
              </SimpleGrid>
            )
        }
      </Stack>

      {/* Add / Edit modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          <Text fw={600} size="lg" style={{ color: '#1a1a2e' }}>
            {editing ? 'Edit Doctor' : 'Add Doctor'}
          </Text>
        }
        size="lg"
        radius="lg"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={12}>
            <Group grow>
              <TextInput label="First Name" placeholder="Priya" {...form.getInputProps('firstName')} />
              <TextInput label="Last Name"  placeholder="Sharma" {...form.getInputProps('lastName')} />
            </Group>
            <Group grow>
              <Select
                label="Specialization"
                placeholder="Select or type"
                data={SPECIALIZATIONS}
                searchable
                {...form.getInputProps('specialization')}
              />
              <TextInput label="Qualification" placeholder="MBBS, MD" {...form.getInputProps('qualification')} />
            </Group>
            <Group grow>
              <TextInput label="Email" placeholder="doctor@hospital.com" {...form.getInputProps('email')} />
              <TextInput label="Phone" placeholder="+91-9876543210" {...form.getInputProps('phone')} />
            </Group>
            <Group grow>
              <NumberInput
                label="Experience (years)"
                placeholder="10"
                min={0}
                max={60}
                {...form.getInputProps('experienceYears')}
              />
              <NumberInput
                label="Consultation Fee (₹)"
                placeholder="500"
                min={0}
                {...form.getInputProps('consultationFee')}
              />
            </Group>
            <TextInput
              label="Available Days"
              placeholder="Mon, Tue, Wed, Thu, Fri"
              {...form.getInputProps('availableDays')}
            />
            <Textarea
              label="Bio"
              placeholder="Brief professional bio..."
              rows={3}
              {...form.getInputProps('bio')}
            />
            <Group justify="flex-end" mt={8}>
              <Button variant="default" onClick={closeModal} radius="md">Cancel</Button>
              <Button
                type="submit"
                loading={saving}
                radius="md"
                style={{ background: 'linear-gradient(135deg, #05abab, #009797)', border: 'none' }}
              >
                {editing ? 'Save Changes' : 'Add Doctor'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={<Text fw={600} c="red">Remove Doctor</Text>}
        size="sm"
        radius="lg"
        centered
      >
        <Text size="sm" mb={20}>
          Are you sure you want to remove{' '}
          <b>Dr. {deleteTarget?.firstName} {deleteTarget?.lastName}</b>?
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={closeDelete} radius="md">Cancel</Button>
          <Button color="red" onClick={handleDelete} radius="md">Remove</Button>
        </Group>
      </Modal>
    </>
  )
}
