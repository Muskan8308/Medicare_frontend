import { useEffect, useState } from 'react'
import {
  Box, Card, Text, Group, Button, TextInput, Select,
  Table, Badge, ActionIcon, Modal, Stack, Textarea,
  ScrollArea, Skeleton, Tooltip, Menu,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { DateInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import {
  IconPlus, IconSearch, IconEdit, IconTrash,
  IconUsers, IconDotsVertical,
} from '@tabler/icons-react'
import { patientApi, Patient } from '../api/services'
import dayjs from 'dayjs'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Patient | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)

  const form = useForm({
    initialValues: {
      firstName: '', lastName: '', email: '', phone: '',
      dateOfBirth: null as Date | null,
      gender: '' as 'MALE' | 'FEMALE' | 'OTHER' | '',
      bloodGroup: '', address: '', medicalHistory: '',
    },
    validate: {
      firstName: (v) => (!v.trim() ? 'Required' : null),
      lastName:  (v) => (!v.trim() ? 'Required' : null),
      email:     (v) => (!/\S+@\S+\.\S+/.test(v) ? 'Valid email required' : null),
      phone:     (v) => (!v.trim() ? 'Required' : null),
      dateOfBirth: (v) => (!v ? 'Required' : null),
      gender:    (v) => (!v ? 'Required' : null),
    },
  })

  const fetchPatients = (q?: string) => {
    setLoading(true)
    patientApi.getAll(q)
      .then((r) => setPatients(r.data))
      .catch(() => notifications.show({ message: 'Failed to load patients', color: 'red' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPatients() }, [])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search || undefined), 350)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => {
    setEditing(null)
    form.reset()
    openModal()
  }

  const openEdit = (p: Patient) => {
    setEditing(p)
    form.setValues({
      firstName: p.firstName,
      lastName:  p.lastName,
      email:     p.email,
      phone:     p.phone,
      dateOfBirth: new Date(p.dateOfBirth),
      gender:    p.gender,
      bloodGroup: p.bloodGroup ?? '',
      address:   p.address ?? '',
      medicalHistory: p.medicalHistory ?? '',
    })
    openModal()
  }

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.dateOfBirth || !values.gender) return
    setSaving(true)
    const payload = {
      ...values,
      dateOfBirth: dayjs(values.dateOfBirth).format('YYYY-MM-DD'),
      gender: values.gender as 'MALE' | 'FEMALE' | 'OTHER',
    }
    try {
      if (editing) {
        await patientApi.update(editing.id, payload as any)
        notifications.show({ message: 'Patient updated', color: 'teal' })
      } else {
        await patientApi.create(payload as any)
        notifications.show({ message: 'Patient registered', color: 'teal' })
      }
      closeModal()
      fetchPatients()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong'
      notifications.show({ message: msg, color: 'red' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await patientApi.delete(deleteTarget.id)
      notifications.show({ message: 'Patient deleted', color: 'teal' })
      closeDelete()
      fetchPatients()
    } catch {
      notifications.show({ message: 'Failed to delete patient', color: 'red' })
    }
  }

  return (
    <>
      <Stack gap={20}>
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Text fw={700} size="xl" style={{ color: '#1a1a2e' }}>Patients</Text>
            <Text size="sm" c="dimmed">Manage patient registrations</Text>
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openAdd}
            style={{ background: 'linear-gradient(135deg, #05abab, #009797)', border: 'none' }}
          >
            Add Patient
          </Button>
        </Group>

        {/* Search bar */}
        <TextInput
          placeholder="Search by name, email or phone..."
          leftSection={<IconSearch size={16} color="#05abab" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: 380 }}
        />

        {/* Table card */}
        <Card radius="lg" p={0} style={{ border: '1px solid #e8f4f4', background: '#fff' }}>
          <ScrollArea>
            <Table horizontalSpacing="lg" verticalSpacing="sm" striped highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ background: '#f8fafa' }}>
                  {['Name', 'Email', 'Phone', 'DOB', 'Gender', 'Blood', 'Status', ''].map((h) => (
                    <Table.Th key={h} style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>
                      {h}
                    </Table.Th>
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
                  : patients.length === 0
                    ? (
                      <Table.Tr>
                        <Table.Td colSpan={8}>
                          <Group justify="center" py={32} gap={8}>
                            <IconUsers size={32} color="#d1d5db" stroke={1.5} />
                            <Text c="dimmed" size="sm">No patients found</Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                    : patients.map((p) => (
                      <Table.Tr key={p.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {p.firstName} {p.lastName}
                          </Text>
                        </Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{p.email}</Text></Table.Td>
                        <Table.Td><Text size="sm">{p.phone}</Text></Table.Td>
                        <Table.Td><Text size="sm">{p.dateOfBirth}</Text></Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="teal" size="sm" radius="sm">
                            {p.gender}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500} style={{ color: '#05abab' }}>
                            {p.bloodGroup || '—'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={p.status === 'ACTIVE' ? 'green' : 'gray'}
                            size="sm"
                            radius="sm"
                          >
                            {p.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu shadow="sm" width={140} position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" radius="md">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => openEdit(p)}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => { setDeleteTarget(p); openDelete() }}
                              >
                                Delete
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

      {/* Add / Edit modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          <Text fw={600} size="lg" style={{ color: '#1a1a2e' }}>
            {editing ? 'Edit Patient' : 'Register Patient'}
          </Text>
        }
        size="lg"
        radius="lg"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={12}>
            <Group grow>
              <TextInput label="First Name" placeholder="John" {...form.getInputProps('firstName')} />
              <TextInput label="Last Name"  placeholder="Doe"  {...form.getInputProps('lastName')} />
            </Group>
            <Group grow>
              <TextInput label="Email"  placeholder="john@email.com" {...form.getInputProps('email')} />
              <TextInput label="Phone"  placeholder="+91-9876543210"  {...form.getInputProps('phone')} />
            </Group>
            <Group grow>
              <DateInput
                label="Date of Birth"
                placeholder="Pick date"
                maxDate={new Date()}
                valueFormat="YYYY-MM-DD"
                {...form.getInputProps('dateOfBirth')}
              />
              <Select
                label="Gender"
                placeholder="Select"
                data={['MALE', 'FEMALE', 'OTHER']}
                {...form.getInputProps('gender')}
              />
            </Group>
            <Group grow>
              <Select
                label="Blood Group"
                placeholder="Select (optional)"
                data={BLOOD_GROUPS}
                clearable
                {...form.getInputProps('bloodGroup')}
              />
            </Group>
            <Textarea
              label="Address"
              placeholder="Patient address..."
              rows={2}
              {...form.getInputProps('address')}
            />
            <Textarea
              label="Medical History"
              placeholder="Any known conditions, allergies, etc."
              rows={3}
              {...form.getInputProps('medicalHistory')}
            />
            <Group justify="flex-end" mt={8}>
              <Button variant="default" onClick={closeModal} radius="md">Cancel</Button>
              <Button
                type="submit"
                loading={saving}
                radius="md"
                style={{ background: 'linear-gradient(135deg, #05abab, #009797)', border: 'none' }}
              >
                {editing ? 'Save Changes' : 'Register Patient'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={<Text fw={600} c="red">Delete Patient</Text>}
        size="sm"
        radius="lg"
        centered
      >
        <Text size="sm" mb={20}>
          Are you sure you want to delete{' '}
          <b>{deleteTarget?.firstName} {deleteTarget?.lastName}</b>? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={closeDelete} radius="md">Cancel</Button>
          <Button color="red" onClick={handleDelete} radius="md">Delete</Button>
        </Group>
      </Modal>
    </>
  )
}
