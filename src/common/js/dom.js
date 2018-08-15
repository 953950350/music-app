export function addClass(el, className) {
  if (hasClass(el, className)) {
    return false
  }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  }
  return el.getAttribute(name)
}

let elementStyle = document.createElement('div').style

let prefix = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    moz: 'mozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  for (let k in transformNames) {
    let value = transformNames[k]
    if (elementStyle[value] !== undefined) {
      return k
    }
  }
  return false
})()

export function prefixStyle(style) {
  if (prefix === false) {
    return false
  } 
  if (prefix === 'transform') {
    return style
  }
  return prefix + style.charAt(0).toUpperCase() + style.substr(1)
}