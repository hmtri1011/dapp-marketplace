import React, { useState, useEffect } from 'react'
import { MakeGenerics, useSearch, useNavigate } from '@tanstack/react-location'
import { useSigner } from 'wagmi'
import axios from 'axios'
import { ethers } from 'ethers'

import { marketplaceAddress } from 'config'
import marketplaceAbi from 'abis/marketplace.json'

export interface ResellNFTProps {}

type ResellLocationGenerics = MakeGenerics<{
  Search: {
    id: number
    tokenURI: string
  }
}>

const ResellNFT = ({}: ResellNFTProps) => {
  const { data: signer, isLoading } = useSigner()
  const navigate = useNavigate()

  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const { id, tokenURI } = useSearch<ResellLocationGenerics>()

  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  async function listNFTForSale() {
    if (!signer) return
    if (!price) return

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()

    navigate({
      to: '/'
    })
  }

  if (!signer) {
    return null
  }

  return (
    <div className='flex justify-center'>
      <div className='w-1/2 flex flex-col pb-12'>
        <input
          placeholder='Asset Price in Eth'
          className='mt-2 border rounded p-4'
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {image && <img className='rounded mt-4' width='350' src={image} />}
        <button onClick={listNFTForSale} className='font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg'>
          List NFT
        </button>
      </div>
    </div>
  )
}

export default ResellNFT
