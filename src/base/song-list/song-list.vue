<template>
	<div class="song-list">
		<ul>
			<li class="item" v-for="(song, index) in songs" @click="selectItem(song, index)">
				<div class="rank-num" v-show="rank">
					<span :class="getRankCls(index)" v-text="getRankText(index)"></span>
				</div>
				<div class="content">
					<h2 class="name">{{ song.name }}</h2>
					<p class="desc">{{ getDesc(song) }}</p>
				</div>
			</li>
		</ul>
	</div>
</template>

<script type="text/ecmascript-6">
	export default {
		props: {
			songs: {
				type: Array,
				default: []
			},
			rank: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			getDesc(song) {
				return `${song.singer} - ${song.album}`;
			},
			selectItem(song, index) {
				this.$emit('select', song, index);
			},
			getRankCls(index) {
				if (index <= 2) {
					return `icon icon${index}`;
				} else {
					return 'text';
				}
			},
			getRankText(index) {
				if (index > 2) {
					return index + 1;
				}
			}
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'
	@import '../../common/stylus/mixin.styl'
	
	.song-list
		.item
			display: flex
			align-items: center
			box-sizing: border-box
			height: 64px
			font-size: $font-size-medium
			.rank-num
				flex: 0 0 25px
				width: 25px
				margin-right: 30px
				text-align: center
				.icon
					display: inline-block
					width: 25px
					height: 24px
					background-size: 25px 24px
					&.icon0
						bg-image('first')
					&.icon1
						bg-image('second')
					&.icon2
						bg-image('third')
				.text
					font-size: $font-size-large
					color: $color-theme
			.content
				flex: 1
				line-height: 20px
				overflow: hidden
				.name
					color: $color-text
					no-wrap()
				.desc
					margin-top: 4px
					color: $color-text-d
					no-wrap()
</style>
