import ReactGA from 'react-ga'
import snarkdown from 'snarkdown'

export const getOverridedComponent = (overrides, componentName) => {
  if (overrides?.[componentName]) {
    const { module, component } = overrides[componentName]
    if (module && component) {
      return window.botpress[module][component]
    }
  }
}

export const isIE = window.navigator.userAgent.match(/MSIE|Trident/) !== null

export const asyncDebounce = async timeMs => {
  let lastClickInMs = undefined

  const debounce = promise => {
    const now = Date.now()
    if (!lastClickInMs) {
      lastClickInMs = now
    }

    if (now - lastClickInMs > timeMs) {
      lastClickInMs = now
      return promise
    }
  }
}

export const downloadFile = (name, blob) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.setAttribute('download', name)

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const checkLocationOrigin = () => {
  if (!window.location.origin) {
    const { protocol, hostname, port } = window.location
    // @ts-ignore
    window.location.origin = `${protocol}//${hostname}${port && ':' + port}`
  }
}

export const initializeAnalytics = () => {
  if (window.SEND_USAGE_STATS) {
    try {
      // @ts-ignore
      ReactGA.initialize('UA-90044826-2', {
        gaOptions: {
          // @ts-ignore
          userId: window.UUID
        }
      })
      // @ts-ignore
      ReactGA.pageview(window.location.pathname + window.location.search)
    } catch (err) {
      console.log('Error init analytics', err)
    }
  }
}

export const trackMessage = (direction: 'sent' | 'received') => {
  if (window.SEND_USAGE_STATS) {
    try {
      ReactGA.event({ category: 'Interactions', action: `message ${direction}` })
    } finally {
    }
  }
}

export const trackWebchatState = (state: 'show' | 'hide' | 'toggle') => {
  if (window.SEND_USAGE_STATS) {
    try {
      ReactGA.event({ category: 'Display', action: state })
    } finally {
    }
  }
}

export const renderUnsafeHTML = (message: string = '', escaped: boolean): string => {
  if (escaped) {
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const html = snarkdown(message)
  return html.replace(/<a href/gi, `<a target="_blank" href`)
}
