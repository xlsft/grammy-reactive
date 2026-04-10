import { useState } from "src/lib";

export const Calculator = async () => {

    const [input, setInput] = useState('0')

    const append = (value: string) => {
        setInput((input === '0' ? value : input + value).replaceAll('Error', ''))
    }
    const clear = () => {
        setInput('0')
    }
    const error = () => {
        throw new Error("Some test error")
    }
    const calculate = () => { try {
        const sanitized = input.replace(/,/g, '.')
        const result = eval(sanitized)
        setInput(result.toString())
    } catch {
        setInput('Error')
    }}

    const buttons = [
        ['7','8','9','/'],
        ['4','5','6','*'],
        ['1','2','3','-'],
        ['0','.','=','+'],
        ['C', 'Error']
    ]
    return <>
        <p>{input}</p>
        {buttons.map(row => (
            row.map((v, i, arr) => {
                if (v === '=') return <button variant='callback' event={`action:${v}`} color="success" onClick={calculate}>{v}</button>
                if (v === 'C') return <button variant='callback' event={`action:${v}`} color="danger" onClick={clear}>{v}</button>
                if (v === 'Error') return <button variant='callback' event={`action:${v}`} color="danger" onClick={error}>{v}</button>
                return <button
                    variant='callback'
                    color={['/', '*', '-', '+'].includes(v) ? 'primary' : undefined}
                    event={`action:${v}`}
                    onClick={() => append(v)}
                    row={i === arr.length - 1}
                >{v}</button>
            })
        ))}
    </>
}
