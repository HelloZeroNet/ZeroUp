class Uploader extends Class
	constructor: ->
		@

	renderSpeed: =>
		"""
			<svg>
			 <linearGradient id="linearColors" x1="0" y1="0" x2="1" y2="1">
			     <stop offset="15%" stop-color="#FF4136"></stop>
			     <stop offset="40%" stop-color="#1BA1E2"></stop>
			     <stop offset="90%" stop-color="#F012BE"></stop>
			  </linearGradient>
			  <circle cx="0" cy="0" r="150" transform="translate(300, 300) rotate(-72.7)" stroke="black" stroke-width="3" class="speed-bg"></circle>
			  <circle cx="0" cy="0" r="155" transform="translate(300, 300) rotate(149.3)" stroke="black" stroke-width="3" class="speed-bg speed-bg-big" stroke="url(#linearColors)"></circle>
			  <circle cx="0" cy="0" r="150" transform="translate(300, 300) rotate(-210)" stroke-width="3" class="speed-current" stroke="url(#linearColors)" id="speed_current"></circle>
			  <text x="190" y="373" class="speed-text">0</text>
			  <text x="173" y="282" class="speed-text">20</text>
			  <text x="217" y="210" class="speed-text">40</text>
			  <text x="292" y="178" class="speed-text">60</text>
			  <text x="371" y="210" class="speed-text">80</text>
			  <text x="404" y="282" class="speed-text">100</text>
			  <text x="390" y="373" class="speed-text">120</text>
			</svg>
		"""

	randomBase2: (len) =>
		return (Math.random()).toString(2).slice(2,len)

	handleFinishUpload: =>
		Page.state.page = "list"
		Page.projector.scheduleRender()
		setTimeout ( =>
			Page.list.update()
		), 1000
		return false

	render: =>
		file_info = Page.selector.file_info
		# Efficient updating svg is not possible in maquette, so manupulated DOM directly
		dash_offset = Math.max(2390 - (486 * file_info.speed / 1024 / 1024 / 100), 1770) + Math.random() * 10
		if dash_offset != @last_dash_offset
			@last_dash_offset = dash_offset
			setTimeout (=>
				document.getElementById("speed_current")?.style.strokeDashoffset = dash_offset # 2390 - 1770
			), 1


		h("div.Uploader", {classes: {hidden: Page.state.page != "uploader"}}, [
			h("div.speed", {innerHTML: @renderSpeed()})
			h("div.status", [
				h("div.icon.icon-file-empty.file-fg", {style: "clip: rect(0px 100px #{114*file_info.percent}px 0px)"}, [
					@randomBase2(13), h("br"), @randomBase2(13), h("br"), @randomBase2(13), h("br"), @randomBase2(40), @randomBase2(40), @randomBase2(40), @randomBase2(24)
				]),
				h("div.icon.icon-file-empty.file-bg"),
				h("div.percent", {style: "transform: translateY(#{114*file_info.percent}px"}, [
					Math.round(file_info.percent * 100),
					h("span.post", "% \u25B6")
				]),
				h("div.name", file_info.name),
				h("div.size", Text.formatSize(file_info.size)),
				if file_info.status == "done"
					h("div.message.message-done", "File uploaded in #{((file_info.updated - file_info.started) / 1000).toFixed(1)}s @ #{Text.formatSize(file_info.speed)}/s!")
				else if file_info.speed
					h("div.message", "Hashing @ #{Text.formatSize(file_info.speed)}/s...")
				else
					h("div.message", "Opening file...")
				h("a.button-big.button-finish", {href: "?List", onclick: @handleFinishUpload, classes: {visible: file_info.status == "done"}}, "Finish upload \u00BB")
			])
		])

window.Uploader = Uploader