# WIP

## description
Vim-like music player inspired by cmus and ranger.

## motivation
To combine cmus and ranger functionality with a nice-looking interface.

## installation
git clone https://github.com/0x1869f/dumb-player  
cd dumb-player  
yarn install  
yarn run build  

## usage
run current release binary  
./release/0.0.1/linux-unpacked/dumb-player  

## key bindings
### File manager
- **O** - open
- **i/space** - mark/unmark current
- **o/enter** - select marked
- **jk** - navigation
- **ctrl+f** - jump to next screen
- **ctrl+b** - jump to previous screen
- **gg** - jump to start
- **G** - jump to end
- **l** - open directory
- **h** - previous directory
- **/** - open filter
- **u** - clear filter
- **q/esq** - close

### Playlist
- **ctrl+l** - clear
- **jk** - navigation
- **ctrl+f** - jump to next screen
- **ctrl+b** - jump to previous screen
- **gg** - jump to start
- **G** - jump to end
- **i/enter** - play selected
- **/** - open filter
- **u** - clear filter

### Player
- **n** - play next
- **p** - play previous
- **c** - pause/play
- **r** - switch random
- **m** - mute/unmute
- **=** - volume +5
- **+** - volume +10
- **-** - volume -5
- **_** - volume -10
- **L** - rewind forward
- **H** - rewind backward

