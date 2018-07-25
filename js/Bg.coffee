class Bg extends Class
	constructor: (@bg_elem) ->
		@item_types = ["video", "gamepad", "ipod", "image", "file"]

		window.onresize = @handleResize
		@handleResize()

		@randomizePosition()
		setTimeout ( =>
			@randomizeAnimation()
		), 10
		@log "inited"

	handleResize: =>
		@width = window.innerWidth
		@height = window.innerHeight


	randomizePosition: ->
		for item in @bg_elem.querySelectorAll(".bgitem")
			top = (Math.random() * @height * 0.8)
			left = (Math.random() * @width * 0.8)
			if Math.random() > 0.8
				[left, top] = @getRandomOutpos()

			rotate = 45 - (Math.random() * 90)
			scale = 0.5 + Math.min(0.5, Math.random())

			item.style.transform = "TranslateX(#{left}px) TranslateY(#{top}px) rotateZ(#{rotate}deg) scale(#{scale})"

	getRandomOutpos: ->
		# Find new pos
		rand = Math.random()
		if rand < 0.25  # Out right
			left = @width + 100
			top = @height * Math.random()
		else if rand < 0.5  # Out bottom
			left = @width * Math.random()
			top = @height + 100
		else if rand < 0.75  # Out left
			left = -100
			top = @height * Math.random()
		else  # Out top
			left = @width * Math.random()
			top = -100
		return [left, top]

	randomizeAnimation: ->
		for item in @bg_elem.querySelectorAll(".bgitem")
			item.style.visibility = "visible"
			interval = 30 + (Math.random() * 60)
			item.style.transition = "all #{interval}s linear"
			[left, top] = @getRandomOutpos()

			rotate = 360 - (Math.random() * 720)
			scale = 0.5 + Math.min(0.5, Math.random())

			item.style.transform = "TranslateX(#{left}px) TranslateY(#{top}px) rotateZ(#{rotate}deg) scale(#{scale})"

			bg = @
			item.addEventListener "transitionend", (e) ->
				if e.propertyName == "transform"
					bg.repositionItem(this)

	repositionItem: (item) =>
		[left, top] = @getRandomOutpos()
		rotate = 360 - (Math.random() * 720)
		scale = 0.5 + Math.min(0.5, Math.random())

		# @bg_elem.removeChild(item)  # Avoid animation
		item.style.transform = "TranslateX(#{left}px) TranslateY(#{top}px) rotateZ(#{rotate}deg) scale(#{scale})"
		# @bg_elem.appendChild(item)  # Re-enable animation

		# [target_left, target_top] = [500, 500]
		# target_rotate = 180 - (Math.random() * 360)
		# item.style.transform = "TranslateX(#{target_left}px) TranslateY(#{target_top}px) rotateZ(#{target_rotate}deg)"

window.Bg = Bg
