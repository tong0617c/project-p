from PIL import Image, ImageDraw
for size in [180,192,512]:
 im=Image.new('RGB',(size,size),'#536451'); d=ImageDraw.Draw(im); s=size/192
 def pts(items): return [(int(x*s),int(y*s)) for x,y in items]
 d.polygon(pts([(38,89),(96,40),(154,89),(154,152),(38,152)]),fill='#f3e5ca')
 d.polygon(pts([(29,88),(96,29),(163,88),(153,99),(96,50),(39,99)]),fill='#e5b973')
 d.rectangle([int(82*s),int(108*s),int(111*s),int(152*s)],fill='#bd795b')
 im.save(f'public/icon-{size}.png')
