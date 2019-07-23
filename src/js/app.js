($ => {

  const btnStart = $('#btn-start')
  const btnSave = $('#btn-save').hide()

  function recordingStart (stream) {
    // Make record button go disabled
    btnStart.hide()

    // Options for our recording
    let options = {
      audioBitsPerSecond: 128 * 1024, // 128Kbps
      videoBitsPerSecond: 6 * 1024 * 1024, // 6Mbps
      mimeType: 'video/webm'
    }

    // Here we'll store our video data
    let recordedData = []

    // We will use the MediaRecorder API
    let mediaRecorder = new MediaRecorder(stream, options)

    // If our stream goes inactive (user clicked "Stop"), stop it
    stream.addEventListener('inactive', () => {
      mediaRecorder.stop()
    })

    // When data is available to our recorder...
    mediaRecorder.addEventListener('dataavailable', e => {
      // Push data to recorded data if available
      if (e.data.size > 0)
        recordedData.push(e.data)
    })

    // On stop, create a blob URL and create a link to it
    mediaRecorder.addEventListener('stop', () => {
      // Generate the blob URL
      let blobURL = URL.createObjectURL(new Blob(recordedData))

      // Update URL
      btnSave.prop('href', blobURL)
      btnSave.prop('download', 'screen-capture.webm')

      // Enable our buttons again
      btnSave.show()
      btnStart.show()
    })

    // Starts our recorder
    mediaRecorder.start()
  }

  $('#btn-start').on('click', e => {
    // Invokes our display capture for audio + video
    navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: {
        frameRate: 60
      }
    }).then(recordingStart).catch(error => {
      console.error(error)
    })
  })

})(jQuery)