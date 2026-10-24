async function promisePool(limit, tasks) { 
    const result = new Array(tasks.length)
    const currentIndex = 0
    // 每个 Worker 循环拉取任务，直到所有任务都被认领完毕
    const runTask = async () => { 
        while (currentIndex < tasks.length) { 
            const index = currentIndex++
            result[index] = await tasks[index]()
        }
    }
    const workers = []
    const count = Math.min(limit, tasks.length)
    for (let i = 0; i < count; i++) {
        workers.push(runTask())
    }
    return Promise.all(workers) 
}

// 防抖
const debounce = (fn, delay = 300) => {
    let timer = null
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => { 
            fn.apply(this, args)
        },delay)
    }
}

const throttle = (fn, delay = 300) => { 
    let last = 0
    return function (...args) { 
        const now = Date.now()
        if (now - last > delay) {
            last = now
            fn.apply(this, args)
        }
    }
}

// 匹配括号
function matchBrackets(str) {
    const stack = []
    const map = new Map()
    map.set('(', ')')
    map.set('[', ']')
    map.set('{', '}')
    for (let s of str) { 
        if (map.has(s)) {
            stack.push(s)
        } else { 
            const left = stack.pop()
            if (s !== map.get(left)) {
                return false
            }
        }
    }
    return stack.length === 0
}

// 无重复最长字串
function lengthOfLongestSubstring(s) { 
    const set = new Set()
    let left = 0, right = 0, maxLength = 0
    while (right < s.length) {
        if (!set.has(s[right])) {
            set.add(s[right])
            right++
            maxLength = Math.max(maxLength, right - left)
        } else { 
            set.delete(s[left])
            left++
            maxLength = Math.max(maxLength, right - left)
        }
    }
    return maxLength
}

