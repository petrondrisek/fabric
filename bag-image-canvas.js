let imageObj = null;

$(function(){
    $('.bag-image-edit-trigger').click(function(e){
        e.preventDefault()
        canvas.remove(canvas.item(1))
        $('.bag-image-edit').addClass('m-active')
        addImage($('.input-upload input[name="custom_image_filename"]').val())
    })

    $('.bag-image-edit__button').click(function(e){
        e.preventDefault()
        generateImageFromCanvas()
    })

    $('.bag-image-edit').mousedown(function(e){
        if($(e.target).hasClass('bag-image-edit') || $(e.target).hasClass('bag-image-edit__close')){
            $('.bag-image-edit').removeClass('m-active')
        } else {
            canvas.setActiveObject(canvas.getObjects()[1])
        }
    })

    $('.bag-image-edit__control').click(function(e){
        var imageObj = canvas.getObjects()[1]

        switch($(this).attr('data-type')) {
            case 'rotate':
                const newAngle = (imageObj.angle == 0) ? 10 : imageObj.angle + 10
                imageObj.rotate(newAngle).setCoords()
                break
            case 'size-increase':
                imageObj.scale(parseFloat(imageObj.scaleX * 1.05))
                break
            case 'size-decrease':
                imageObj.scale(parseFloat(imageObj.scaleX * .95))
                break
            default:
                return false
        }
        canvas.renderAll()
    })
})

var params = {
    mobile: {
        canvasWidth: 800,
        canvasHeight: 800,
        cutoutWidth: 400,
        cutoutHeight: 440,
        imageCornerSize: 0
    },
    desktop: {
        canvasWidth: $('.bag-image-edit__container').outerWidth(),
        canvasHeight: $('.bag-image-edit__container').outerHeight(),
        cutoutWidth: 400,
        cutoutHeight: 440,
        imageCornerSize: 20
    }
}

function getParams(){
    if(window.innerWidth <= 640){
        return params.mobile
    } else {
        return params.desktop
    }
}

function generateImageFromCanvas(){
    canvas.discardActiveObject()
    canvas.renderAll()

    const imageBase64 = canvas.toDataURL({
        left: (getParams().canvasWidth / 2) - (getParams().cutoutWidth / 2),
        top: (getParams().canvasHeight / 2) - (getParams().cutoutHeight / 2),
        width: getParams().cutoutWidth,
        height: getParams().cutoutHeight
    })

    $('.bag-image-edit').removeClass('m-active')
    saveImageFromCanvas(imageBase64)
}

async function saveImageFromCanvas(base64){
    let blob = null;

    await fetch(base64)
    .then(res => res.blob())
    .then(data => {
        blob = new Blob([data], {type: "image/png"})
        console.log(data);
    });

    let url = URL.createObjectURL(blob);
    $("#results").attr("src", url);
}

fabric.Canvas.prototype.customiseControls({
    mtr: {
        cursor: 'pointer'
    }
})

fabric.Object.prototype.customiseCornerIcons({
    settings: {
        cornerSize: 24,
        cornerShape: 'rect',
        cornerBackgroundColor: 'transparent',
        borderColor: 'black',
    },
    tl: {
        icon: '002-increase-size-option-2.png'
    },
    tr: {
        icon: '002-increase-size-option.png'
    },
    bl: {
        icon: '002-increase-size-option.png'
    },
    br: {
        icon: '002-increase-size-option-2.png'
    },
    mtr: {
        icon: '001-update-arrow.png'
    },
})

const canvas = new fabric.Canvas('canvas', {
    backgroundColor: '#b88216',
    controlsAboveOverlay: true,
    preserveObjectStacking: true,
    selection: false,
    width: getParams().canvasWidth,
    height: getParams().canvasWidth
})

var resizeTimeout
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function(){
        canvas.setDimensions({
            width: getParams().canvasWidth,
            height: getParams().canvasHeight
        })

        clipRect.left = (getParams().canvasWidth / 2) - (getParams().cutoutWidth / 2)
        clipRect.top = (getParams().canvasHeight / 2) - (getParams().cutoutHeight / 2)
        clipRect.width = getParams().cutoutWidth
        clipRect.height = getParams().cutoutHeight

        if(canvas.item(1)){
            canvas.item(1).set({
                cornerSize: getParams().imageCornerSize,
                left: clipRect.left,
                top: clipRect.top
            })
        }

        canvas.renderAll()
    }, 500)
})

var clipRect = new fabric.Rect({
    originX: 'left',
    originY: 'top',
    left: (getParams().canvasWidth / 2) - (getParams().cutoutWidth / 2),
    top: (getParams().canvasHeight / 2) - (getParams().cutoutHeight / 2),
    width: getParams().cutoutWidth,
    height: getParams().cutoutHeight,
    fill: '#fff',
    canvasFill: '#fff',
    etiquetteFill: '#b88216',
    selectable: false,
    evented: false
})
canvas.clipPath = clipRect
canvas.add(clipRect)

canvas.renderAll()

function addImage(imageSrc){
    let image = new Image()
    image.onload = function (img) {

        imageObj = new fabric.Image(image, {
            left: clipRect.left,
            top: clipRect.top,
            scaleX: 1,
            scaleY: 1,
            originX: 'left',
            originY: 'top',
            transparentCorners: true,
            cornerSize: getParams().imageCornerSize,
            borderColor: '#ccc'
        })

        imageObj.scaleToWidth(getParams().cutoutWidth)

        imageObj.setControlsVisibility({
            mt: false, 
            mb: false, 
            ml: false, 
            mr: false
        })

        canvas.add(imageObj)
        canvas.setActiveObject(imageObj)
    }
    image.src = imageSrc

    canvas.renderAll()
}

function removeImage(){
    if(imageObj){
        canvas.remove(imageObj);
        imageObj = null;
    }
}