import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { DatesProvider } from '@mantine/dates'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/charts/styles.css'
import './index.css'
import App from './App'
import { AuthProvider } from './hooks/useAuth'

const theme = createTheme({
  fontFamily: 'DM Sans, sans-serif',
  fontFamilyMonospace: 'monospace',
  headings: { fontFamily: 'DM Sans, sans-serif', fontWeight: '600' },
  primaryColor: 'teal',
  primaryShade: 7,
  defaultRadius: 'md',
  colors: {
    teal: [
      '#e6fafa',
      '#cdf2f2',
      '#9be5e5',
      '#65d8d8',
      '#3dcece',
      '#26c7c7',
      '#17c4c4',
      '#05abab',
      '#009797',
      '#008282',
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: 'md' },
    },
    Input: {
      defaultProps: { radius: 'md' },
    },
    Card: {
      defaultProps: { radius: 'lg' },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <DatesProvider settings={{ firstDayOfWeek: 0 }}>
        <Notifications position="top-right" />
        <AuthProvider>
          <App />
        </AuthProvider>
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>
)
