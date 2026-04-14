import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  Avatar,
  Menu,
  UnstyledButton,
  Divider,
  Box,
  rem,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconLayoutDashboard,
  IconUsers,
  IconStethoscope,
  IconCalendarClock,
  IconHome2,
  IconLogout,
  IconUser,
  IconChevronDown,
  IconHeartRateMonitor,
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { path: '/',            label: 'Home',          icon: IconHome2 },
  { path: '/dashboard',  label: 'Dashboard',      icon: IconLayoutDashboard },
  { path: '/patients',   label: 'Patients',       icon: IconUsers },
  { path: '/doctors',    label: 'Doctors',        icon: IconStethoscope },
  { path: '/appointments', label: 'Appointments', icon: IconCalendarClock },
]

export default function AppShellLayout() {
  const [opened, { toggle }] = useDisclosure()
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    notifications.show({ message: 'Logged out successfully', color: 'teal' })
    navigate('/login')
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={0}
    >
      {/* ── Header ── */}
      <AppShell.Header
        style={{
          borderBottom: '1px solid #e8f4f4',
          background: '#ffffff',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap={8}>
              <IconHeartRateMonitor size={26} color="#05abab" stroke={1.8} />
              <Text
                fw={700}
                size="lg"
                style={{ color: '#1a1a2e', letterSpacing: '-0.3px' }}
              >
                Medi<span style={{ color: '#05abab' }}>Care</span>
              </Text>
            </Group>
          </Group>

          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap={8}>
                  <Avatar size={32} radius="xl" color="teal" variant="filled">
                    {username?.[0]?.toUpperCase() ?? 'A'}
                  </Avatar>
                  <Box visibleFrom="sm">
                    <Text size="sm" fw={500} style={{ color: '#1a1a2e' }}>
                      {username}
                    </Text>
                    <Text size="xs" c="dimmed">Administrator</Text>
                  </Box>
                  <IconChevronDown size={14} color="#888" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUser size={14} />} disabled>
                Profile
              </Menu.Item>
              <Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      {/* ── Sidebar ── */}
      <AppShell.Navbar
        p="sm"
        style={{ background: '#ffffff', borderRight: '1px solid #e8f4f4' }}
      >
        <Box mt={4}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={
                  <item.icon
                    size={18}
                    stroke={1.8}
                    color={active ? '#05abab' : '#6b7280'}
                  />
                }
                active={active}
                onClick={() => {
                  navigate(item.path)
                  if (opened) toggle()
                }}
                styles={{
                  root: {
                    borderRadius: '10px',
                    marginBottom: '2px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#05abab' : '#374151',
                    backgroundColor: active ? '#e6fafa' : 'transparent',
                    '&:hover': {
                      backgroundColor: active ? '#e6fafa' : '#f8fafa',
                    },
                  },
                }}
              />
            )
          })}
        </Box>

        {/* Footer info */}
        <Box
          mt="auto"
          pt="md"
          style={{ borderTop: '1px solid #e8f4f4' }}
        >
          <Text size="xs" c="dimmed" ta="center">
            MediCare v1.0.0
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Patient Management System
          </Text>
        </Box>
      </AppShell.Navbar>

      {/* ── Main Content ── */}
      <AppShell.Main style={{ background: '#f8fafa' }}>
        <Box p="lg" mih="calc(100vh - 60px)">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
