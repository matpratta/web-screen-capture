($ => {

  // Our interface
  const textStatus = $('#status')
  const btnStart = $('#btn-start')
  const btnStop = $('#btn-stop').addClass('disabled')
  const btnSave = $('#btn-save').addClass('disabled')
  const optCodec = $('#opt-codec')
  const optBitrateVideo = $('#opt-bitrate-video')
  const optBitrateAudio = $('#opt-bitrate-audio')
  const preview = $('#preview')
  const previewContainer = $('#previewContainer').hide()

  // This sets the status
  function status (status) {
    console.info('Status:', status)
    textStatus.text(status)
  }

  // Here we define our mime types for our selector
  const mimeTypes = {
    'WebM': { type: 'video/webm', ext: 'webm' },
    'H.264': { type: 'video/mp4', ext: 'mp4' },
    'MPEG': { type: 'video/mpeg', ext: 'mpg' },
    '3GPP': { type: 'video/3gpp', ext: '3gp' },
    'OGG/OGV': { type: 'video/ogg', ext: 'ogv' },
    'AVI': { type: 'video/x-msvideo', ext: 'avi' },
  }

  // Load Mime Types
  status('Loading mime types...')
  for (let label in mimeTypes) {
    // Get our type info
    let mime = mimeTypes[label]

    // Checks if the type is supported
    if (!MediaRecorder.isTypeSupported(mime.type))
      continue

    // Append our mime type
    optCodec.append(
      $('<option>')
        .prop('value', label)
        .text(label)
    )
  }

  function recordingStart (stream) {
    // Make record button go disabled
    btnStart.addClass('disabled')
    btnStop.removeClass('disabled')

    status('Setting up recorder...')

    // Gets our mime type
    let mime = mimeTypes[optCodec.val()]

    // Gets our bitrates
    let bitrateVideo = optBitrateVideo.val()
    let bitrateAudio = optBitrateAudio.val()

    // Options for our recording
    let options = {
      audioBitsPerSecond: bitrateAudio,
      videoBitsPerSecond: bitrateVideo,
      mimeType: mime.type
    }

    // Here we'll store our video data
    let recordedData = []

    // We will use the MediaRecorder API
    let mediaRecorder = new MediaRecorder(stream, options)

    // If our stream goes inactive (user clicked "Stop" on the browser bar), stop it
    stream.addEventListener('inactive', () => {
      status('Stream inactive, stopping...')
      mediaRecorder.stop()
    })

    // If the user clicks "Stop" in our controls, stop it too.
    btnStop.on('click', () => {
      status('User requested stop, stopping...')
      stream.getTracks().forEach(track => track.stop())
    })

    // When data is available to our recorder...
    mediaRecorder.addEventListener('dataavailable', e => {
      // Push data to recorded data if available
      status('Receiving data...')
      if (e.data.size > 0)
        recordedData.push(e.data)
    })

    // On stop, create a blob URL and create a link to it
    mediaRecorder.addEventListener('stop', () => {
      // Generate the blob URL
      status('Generating file link...')
      let blobURL = URL.createObjectURL(new Blob(recordedData))

      // Update preview
      preview.prop('src', blobURL)
      previewContainer.show()

      // Update URL
      btnSave.prop('href', blobURL)
      btnSave.prop('download', `screen-capture.${mime.ext}`)

      // Enable our buttons again
      btnSave.removeClass('disabled')
      btnStart.removeClass('disabled')
      btnStop.addClass('disabled')

      status('Download available!')
    })

    // Starts our recorder
    mediaRecorder.start()

    status('Recording.')
  }

  $('#btn-start').on('click', e => {
    // Invokes our display capture for audio + video
    status('Requesting user permission...')
    navigator.mediaDevices.getDisplayMedia({
      audio: {
        sampleSize: 24,
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false
      },
      video: {
        frameRate: 60
      }
    }).then(recordingStart).catch(error => {
      status('Permission denied.')
      console.error(error)
    })
  })

  status('Ready to record.')

})(jQuery)