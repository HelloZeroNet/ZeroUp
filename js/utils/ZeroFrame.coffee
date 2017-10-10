class ZeroFrame extends Class
	constructor: (url) ->
		@queue = []
		@url = url
		@waiting_cb = {}
		@history_state = {}
		@wrapper_nonce = document.location.href.replace(/.*wrapper_nonce=([A-Za-z0-9]+).*/, "$1")
		@connect()
		@next_message_id = 1
		@init()
		@ready = false


	init: ->
		@

	connect: ->
		@target = window.parent
		window.addEventListener("message", @onMessage, false)
		@send({"cmd": "innerReady"})

		# Save scrollTop
		window.addEventListener "beforeunload", (e) =>
			@log "Save scrollTop", window.pageYOffset
			@history_state["scrollTop"] = window.pageYOffset
			@cmd "wrapperReplaceState", [@history_state, null]

		# Restore scrollTop
		@cmd "wrapperGetState", [], (state) =>
			@handleState(state)

	handleState: (state) ->
		@history_state = state if state?
		@log "Restore scrollTop", state, window.pageYOffset
		if window.pageYOffset == 0 and state
			window.scroll(window.pageXOffset, state.scrollTop)


	onMessage: (e) =>
		message = e.data
		cmd = message.cmd
		if cmd == "response"
			if @waiting_cb[message.to]?
				@waiting_cb[message.to](message.result)
			else
				@log "Websocket callback not found:", message
		else if cmd == "wrapperReady" # Wrapper inited later
			@send({"cmd": "innerReady"})
		else if cmd == "ping"
			@response message.id, "pong"
		else if cmd == "wrapperOpenedWebsocket"
			@onOpenWebsocket()
			@ready = true
			@processQueue()
		else if cmd == "wrapperClosedWebsocket"
			@onCloseWebsocket()
		else if cmd == "wrapperPopState"
			@handleState(message.params.state)
			@onRequest cmd, message.params
		else
			@onRequest cmd, message.params

	processQueue: ->
		for [cmd, params, cb] in @queue
			@cmd(cmd, params, cb)
		@queue = []

	onRequest: (cmd, message) =>
		@log "Unknown request", message


	response: (to, result) ->
		@send {"cmd": "response", "to": to, "result": result}


	cmd: (cmd, params={}, cb=null) ->
		if @ready
			@send {"cmd": cmd, "params": params}, cb
		else
			@queue.push([cmd, params, cb])

	send: (message, cb=null) ->
		message.wrapper_nonce = @wrapper_nonce
		message.id = @next_message_id
		@next_message_id += 1
		@target.postMessage(message, "*")
		if cb
			@waiting_cb[message.id] = cb


	onOpenWebsocket: =>
		@log "Websocket open"


	onCloseWebsocket: =>
		@log "Websocket close"



window.ZeroFrame = ZeroFrame