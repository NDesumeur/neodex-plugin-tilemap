# Tilemap

A tile map editor for your 2D games.

*Version française : [README.md](README.md)*

- **32 pixel-art 16×16 tiles** (ground, water, walls, trees, chests, doors…) on **two layers**.
- Pencil, fill, rectangle, eraser (or right click), picker, grid, **Ctrl+Z / Ctrl+Y**.
- Several maps from 16×12 to 64×40, saved as you go.
- **PNG export**, and **Tiled export** (`.tmj` + its tile sheet) for Tiled, Godot, Phaser, LDtk…

Shortcuts: P pencil · F fill · R rectangle · E eraser · I picker · G grid · A auto edges · 1 and 2: layer.

## Auto edges (new in 1.2.0)

Grounds join up by themselves: grass over dirt, sand over water, jagged shores and closed corners, also in PNG and Tiled exports.

## Auto edges (1.2.0)

The **AUTO EDGES** button (key A) joins grounds by themselves: grass spills over dirt and path, sand over water, water over deep water, with a jagged edge and a small shadow; corners close too. Built grounds (paving, bricks, walls, roof…) stay sharp. The setting is kept per map. PNG export shows the edges, and Tiled export adds a composed tile to the sheet for each edge cell: Tiled shows the same map.

## Tile sets

Above the palette, pick a set: **Nature**, **Cave** (cave floor and rock, gravel, underground water, stalagmite, gold ore, glowing mushrooms, bone, mine cart), **Town** (road, crosswalk, sidewalk, tiles, street lamp, bench, bin, mailbox, flower pot) or **Snow** (packed snow, snow and grass, cracked ice, snowman, snowy fir, snowy rock, ice block, campfire). **All** shows every tile. New tiles are added at the end of the sheet: your existing maps don't change.
