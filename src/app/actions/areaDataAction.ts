'use server'

export const getProvince = async () => {
  try {
    const prov = await fetch('https://wilayah.id/api/provinces.json')
    return await prov.json()
  } catch (error) {
    console.error('Error fetching regencies:', error)
    return []
  }
}

export const getRegency = async (provinceCode: string) => {
  try {
    const prov = await fetch(
      `https://wilayah.id/api/regencies/${provinceCode}.json`
    )
    return await prov.json()
  } catch (error) {
    console.error('Error fetching regencies:', error)
    return []
  }
}
export const getDistricts = async (regencyCode: string) => {
  try {
    const prov = await fetch(
      `https://wilayah.id/api/districts/${regencyCode}.json`
    )
    return await prov.json()
  } catch (error) {
    console.error('Error fetching regencies:', error)
    return []
  }
}

export const getVillages = async (districtsCode: string) => {
  try {
    const prov = await fetch(
      `https://wilayah.id/api/villages/${districtsCode}.json`
    )
    return await prov.json()
  } catch (error) {
    console.error('Error fetching regencies:', error)
    return []
  }
}
