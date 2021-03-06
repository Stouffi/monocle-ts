import { indexArray } from '../src/Index/Array'
import { indexNonEmptyArray } from '../src/Index/NonEmptyArray'
import { indexStrMap } from '../src/Index/StrMap'
import * as assert from 'assert'
import { some, none } from 'fp-ts/lib/Option'
import * as SM from 'fp-ts/lib/StrMap'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { Iso } from '../src'

describe('Index', () => {
  describe('indexStrMap', () => {
    const index = indexStrMap<string>().index('key')

    it('get', () => {
      const map = SM.singleton('key', 'value')
      assert.deepStrictEqual(index.getOption(map), some('value'))
    })

    it('set if there', () => {
      const map = SM.singleton('key', 'value')
      const newMap = index.set('new')(map)
      assert.deepStrictEqual(newMap, SM.singleton('key', 'new'))
    })

    it('leave if missing', () => {
      const map = new SM.StrMap<string>({})
      const newMap = index.set('new')(map)
      assert.deepStrictEqual(newMap, map)
    })
  })

  describe('indexArray', () => {
    const one = indexArray<string>().index(1)

    it('get', () => {
      assert.deepStrictEqual(one.getOption(['a']), none)
      assert.deepStrictEqual(one.getOption(['a', 'b']), some('b'))
    })

    it('get', () => {
      assert.deepStrictEqual(one.set('x')(['a']), ['a'])
      assert.deepStrictEqual(one.set('x')(['a', 'b']), ['a', 'x'])
    })

    it('modify', () => {
      assert.deepStrictEqual(one.modify(v => `${v}X`)(['a']), ['a'])
      assert.deepStrictEqual(one.modify(v => `${v}X`)(['a', 'b']), ['a', 'bX'])
    })

    it('modifyOption', () => {
      assert.deepStrictEqual(one.modifyOption(v => `${v}X`)(['a']), none)
      assert.deepStrictEqual(one.modifyOption(v => `${v}X`)(['a', 'b']), some(['a', 'bX']))
    })
  })

  describe('indexNonEmptyArray', () => {
    const one = indexNonEmptyArray<string>().index(1)

    it('get', () => {
      assert.deepStrictEqual(one.getOption(new NonEmptyArray('a', [])), none)
      assert.deepStrictEqual(one.getOption(new NonEmptyArray('a', ['b'])), some('b'))
    })

    it('get', () => {
      assert.deepStrictEqual(one.set('x')(new NonEmptyArray('a', [])), new NonEmptyArray('a', []))
      assert.deepStrictEqual(one.set('x')(new NonEmptyArray('a', ['b'])), new NonEmptyArray('a', ['x']))
    })

    it('modify', () => {
      assert.deepStrictEqual(one.modify(v => `${v}X`)(new NonEmptyArray('a', [])), new NonEmptyArray('a', []))
      assert.deepStrictEqual(one.modify(v => `${v}X`)(new NonEmptyArray('a', ['b'])), new NonEmptyArray('a', ['bX']))
    })

    it('modifyOption', () => {
      assert.deepStrictEqual(one.modifyOption(v => `${v}X`)(new NonEmptyArray('a', [])), none)
      assert.deepStrictEqual(
        one.modifyOption(v => `${v}X`)(new NonEmptyArray('a', ['b'])),
        some(new NonEmptyArray('a', ['bX']))
      )
    })
  })

  it('fromIso', () => {
    const iso = new Iso<Array<string>, Array<number>>(s => s.map(v => +v), a => a.map(String))
    const index = indexArray<number>()
      .fromIso(iso)
      .index(1)
    assert.deepStrictEqual(index.getOption([]), none)
    assert.deepStrictEqual(index.getOption(['1']), none)
    assert.deepStrictEqual(index.getOption(['1', '2']), some(2))

    assert.deepStrictEqual(index.set(3)([]), [])
    assert.deepStrictEqual(index.set(3)(['1']), ['1'])
    assert.deepStrictEqual(index.set(3)(['1', '2']), ['1', '3'])
  })
})
