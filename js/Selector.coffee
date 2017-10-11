class Selector extends Class
	constructor: ->
		@file_info = {}

		document.body.ondragover = (e) =>
			if e.dataTransfer.items[0]?.kind == "file"
				document.body.classList.add("drag-over")
			@preventEvent(e)

		document.body.ondragleave = (e) =>
			if not e.pageX
				document.body.classList.remove("drag-over")
			@preventEvent(e)

	checkContentJson: (cb) =>
		inner_path = "data/users/" + Page.site_info.auth_address + "/content.json"
		Page.cmd "fileGet", [inner_path, false], (res) =>
			if res
				res = JSON.parse(res)
			res ?= {}
			optional_pattern = "(?!data.json)"
			if res.optional == optional_pattern
				return cb()

			res.optional = optional_pattern
			Page.cmd "fileWrite", [inner_path, Text.fileEncode(res)], cb

	registerUpload: (title, file_name, file_size, date_added, cb) =>
		inner_path = "data/users/" + Page.site_info.auth_address + "/data.json"
		Page.cmd "fileGet", [inner_path, false], (res) =>
			if res
				res = JSON.parse(res)
			res ?= {}
			res.file ?= {}
			res.file[file_name] = {
				title: title,
				size: file_size,
				date_added: date_added
			}
			Page.cmd "fileWrite", [inner_path, Text.fileEncode(res)], cb

	handleUploadDone: (file) =>
		Page.setUrl("?Latest")
		@log "Upload done", file

	uploadFile: (file) =>
		if file.size > 200 * 1024 * 1024
			Page.cmd("wrapperNotification", ["info", "Maximum file size on this site during the testing period: 200MB"])
			return false
		if file.size < 10 * 1024 * 1024
			Page.cmd("wrapperNotification", ["info", "Minimum file size: 10MB"])
			return false
		if file.name.split(".").slice(-1)[0] not in ["mp4", "gz", "zip", "webm"]
			Page.cmd("wrapperNotification", ["info", "Only mp4, webm, tar.gz, zip files allowed on this site"])
			debugger
			return false

		@file_info = {}
		@checkContentJson (res) =>
			file_name = file.name

			# Add timestamp to filename if it has low amount of English characters
			if file_name.replace(/[^A-Za-z0-9]/g, "").length < 20
				file_name = Time.timestamp() + "-" + file_name

			Page.cmd "bigfileUploadInit", ["data/users/" + Page.site_info.auth_address + "/" + file_name, file.size], (init_res) =>
				formdata = new FormData()
				formdata.append(file_name, file)

				req = new XMLHttpRequest()
				@req = req
				@file_info = {size: file.size, name: file_name, type: file.type, url: init_res.url}
				req.upload.addEventListener "loadstart", (progress) =>
					@log "loadstart", arguments
					@file_info.started = progress.timeStamp
					Page.setPage("uploader")
				req.upload.addEventListener "loadend", =>
					@log "loadend", arguments
					@file_info.status = "done"
					@registerUpload file.name.replace(/\.[^\.]+$/, ""), init_res.file_relative_path, file.size, Time.timestamp(), (res) =>
						Page.cmd "siteSign", {inner_path: "data/users/" + Page.site_info.auth_address + "/content.json"}, (res) =>
							Page.cmd "sitePublish", {inner_path: "data/users/" + Page.site_info.auth_address + "/content.json", "sign": false}, (res) =>
								@handleUploadDone(file)

				req.upload.addEventListener "progress", (progress) =>
					@file_info.speed = 1000 * progress.loaded / (progress.timeStamp - @file_info.started)

					@file_info.percent = progress.loaded / progress.total
					@file_info.loaded = progress.loaded
					@file_info.updated = progress.timeStamp
					Page.projector.scheduleRender()
				req.addEventListener "load", =>
					@log "load", arguments
				req.addEventListener "error", =>
					@log "error", arguments
				req.addEventListener "abort", =>
					@log "abort", arguments

				req.withCredentials = true
				req.open("POST", init_res.url)
				req.send(formdata)

	handleFileDrop: (e) =>
		@log "File drop", e
		document.body.classList.remove("drag-over")

		if not event.dataTransfer.files[0]
			return false
		@preventEvent(e)
		if Page.site_info.cert_user_id
			@uploadFile(event.dataTransfer.files[0])
		else
			Page.cmd "certSelect", [["zeroid.bit"]], (res) =>
				@uploadFile(event.dataTransfer.files[0])

	handleBrowseClick: (e) =>
		if Page.site_info.cert_user_id
			@handleUploadClick(e)
		else
			Page.cmd "certSelect", [["zeroid.bit"]], (res) =>
				@handleUploadClick(e)

	handleUploadClick: (e) =>
		input = document.createElement('input')
		document.body.appendChild(input)
		input.type = "file"
		input.style.visibility = "hidden"
		input.onchange = (e) =>
			@uploadFile(input.files[0])
		input.click()
		return false

	preventEvent: (e) =>
		e.stopPropagation()
		e.preventDefault()

	render: =>
		h("div#Selector.Selector", {classes: {hidden: Page.state.page != "selector"}},
			h("div.browse", [
				h("div.icon.icon-upload"),
				h("a.button", {href: "#Browse", onclick: @handleBrowseClick}, "Select file from computer")
			]),
			h("div.dropzone", {ondragenter: @preventEvent, ondragover: @preventEvent, ondrop: @handleFileDrop})
		)

window.Selector = Selector