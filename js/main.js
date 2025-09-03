// Set current timestamp on page load
document.addEventListener('DOMContentLoaded', function () {
  const currentTimeMillis = Date.now()
  document.getElementById('timestamp-input').value = currentTimeMillis

  // Parse different timestamp formats
  let date = parseTimestamp(currentTimeMillis)
  if (isNaN(date.getTime())) return

  updateTimestamps(date)
  updateTimezoneTimes(date)

  // Add click event for other timezones button
  document.getElementById('other-timezones-btn').addEventListener('click', function () {
    const list = document.getElementById('other-timezones-list')
    list.classList.toggle('hidden')
  })
})

// Input change event
document.getElementById('timestamp-input').addEventListener('input', function () {
  const inputValue = this.value.trim()
  if (inputValue) {
    // Parse different timestamp formats
    let date = parseTimestamp(inputValue)
    if (isNaN(date.getTime())) return

    updateTimestamps(date)
    // Update other timezones list
    const list = document.getElementById('other-timezones-list')
    if (!list.classList.contains('hidden')) {
      updateTimezoneTimes(date)
    }
  }
})

// Copy functionality
document.querySelectorAll('.copy-btn').forEach((button) => {
  button.addEventListener('click', async function () {
    const textToCopy = this.getAttribute('data-copy')

    try {
      await navigator.clipboard.writeText(textToCopy)

      // Visual feedback
      const originalText = this.textContent
      this.classList.add('copied')
      this.textContent = window.i18nMessages.copied

      setTimeout(() => {
        this.classList.remove('copied')
        this.textContent = originalText
      }, 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)

      const originalText = this.textContent
      this.classList.add('copied')
      this.textContent = window.i18nMessages.copied

      setTimeout(() => {
        this.classList.remove('copied')
        this.textContent = originalText
      }, 2000)
    }
  })
})

// Update timestamps in real-time (optional enhancement)
function updateTimestamps(date) {
  // Update display elements
  const utcTime = date.toISOString().replace('T', ' ').substring(0, 19)
  document.getElementById('utc-time').textContent = utcTime
  document.getElementById('copy-utc-time').setAttribute('data-copy', utcTime)

  // Update timestamp display
  const timestampInSeconds = Math.floor(date.getTime() / 1000)
  document.getElementById('timestamp-seconds').textContent = timestampInSeconds
  document.getElementById('copy-timestamp-seconds').setAttribute('data-copy', timestampInSeconds)

  const timestampInMilliseconds = date.getTime()
  document.getElementById('timestamp-milliseconds').textContent = timestampInMilliseconds
  document.getElementById('copy-timestamp-milliseconds').setAttribute('data-copy', timestampInMilliseconds)

  // Update local time display
  updateLocalTimeDisplay(date.getTime())

  // For now, we'll just update the UTC time
  // In a full implementation, we'd update all time formats
}

// Parse multiple time formats
function parseTimestamp(input) {
  // Ensure input is string type
  input = String(input).trim()

  // If empty, return current time
  if (!input) {
    return new Date()
  }

  // Check if it's a pure number (timestamp)
  if (/^\d+$/.test(input)) {
    const num = parseInt(input, 10)
    // Determine if it's seconds or milliseconds
    if (num < 10000000000) {
      // Second-level timestamp
      return new Date(num * 1000)
    } else {
      // Millisecond-level timestamp
      return new Date(num)
    }
  }

  return new Date(input)
}

// Get local timezone information
function getLocalTimezoneInfo() {
  const now = new Date()
  const timezoneOffset = -now.getTimezoneOffset()
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Use timezone name mapping from i18n messages
  const timezoneNameMap = window.i18nMessages.timezoneNameMap
  const displayName = timezoneNameMap[timezoneName] || timezoneName

  // Calculate UTC offset
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
  const offsetMinutes = Math.abs(timezoneOffset) % 60
  const offsetSign = timezoneOffset >= 0 ? '+' : '-'
  const utcOffset = `UTC${offsetSign}${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`

  return {
    offset: timezoneOffset,
    name: displayName,
    utcOffset: utcOffset,
  }
}

// Update local time display
function updateLocalTimeDisplay(timestamp) {
  // Parse timestamp - could be in seconds or milliseconds
  let ts = parseInt(timestamp)
  if (isNaN(ts)) return

  // Handle both seconds and milliseconds timestamp formats
  if (ts < 10000000000) {
    // If it's in seconds
    ts = ts * 1000
  }

  const date = new Date(ts)
  const timezoneInfo = getLocalTimezoneInfo()

  // Update the first local time display item (full time)
  // Use toLocaleString to correctly display local time
  const localTimeFull = formatDateTime(date)
  document.getElementById('local-time-full').textContent = localTimeFull
  document.getElementById('copy-local-full').setAttribute('data-copy', localTimeFull)
  document.getElementById(
    'local-timezone-name'
  ).textContent = `${timezoneInfo.utcOffset} ${timezoneInfo.name} (${window.i18nMessages.localTime})`

  // Update the second local time display item (date only)
  const localTimeDate = localTimeFull.substring(0, 10)
  document.getElementById('local-time-date').textContent = localTimeDate
  document.getElementById('copy-local-date').setAttribute('data-copy', localTimeDate)
  document.getElementById(
    'local-timezone-name-date'
  ).textContent = `${timezoneInfo.utcOffset} ${timezoneInfo.name} (${window.i18nMessages.localTimeDate})`
}

// Update timezone times display
function updateTimezoneTimes(date) {
  // Update all timezone times
  document.querySelectorAll('.timezone-time').forEach((element) => {
    const offset = parseInt(element.getAttribute('data-offset'))

    const timeString = formatDateTime(date, offset)
    element.textContent = timeString

    // Update the corresponding copy button's data-copy attribute
    const copyButton = element.closest('.flex').querySelector('.copy-btn')
    copyButton.setAttribute('data-copy', timeString)
  })
}

/**
 * Format a Date object to "YYYY-MM-DD HH:mm:ss" format
 * @param {Date} date - The Date object to format
 * @param {number} timezoneOffset - Optional timezone offset in minutes, defaults to local timezone offset
 * @returns {string} Formatted date string in "YYYY-MM-DD HH:mm:ss" format
 */
function formatDateTime(date, timezoneOffset) {
  // If timezoneOffset is not provided, use the local timezone offset
  if (timezoneOffset === undefined) {
    timezoneOffset = -date.getTimezoneOffset()
  }

  const localDate = new Date(date.getTime() + timezoneOffset * 60000)
  return localDate.toISOString().replace('T', ' ').substring(0, 19)
}
