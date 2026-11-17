import { db } from '../lib/db'

export const profileRepository = {
  async getProfile() {
    return db.getFirstUserProfile()
  },

  async updateProfile(input) {
    const currentProfile = await db.getFirstUserProfile()
    if (!currentProfile) {
      return undefined
    }

    const alturaMetros = input.altura / 100
    const imc = alturaMetros > 0 ? input.pesoCorporal / (alturaMetros * alturaMetros) : currentProfile.imc

    const updatedProfile = {
      ...currentProfile,
      nombre: input.nombre.trim() || undefined,
      pesoCorporal: input.pesoCorporal,
      altura: input.altura,
      imc,
      updatedAt: new Date().toISOString(),
    }

    await db.putUserProfile(updatedProfile)
    return updatedProfile
  },

  async updateUnitSystem(unitSystem) {
    const currentProfile = await db.getFirstUserProfile()
    if (!currentProfile) {
      return undefined
    }

    const updatedProfile = {
      ...currentProfile,
      unitSystem,
      updatedAt: new Date().toISOString(),
    }

    await db.putUserProfile(updatedProfile)
    return updatedProfile
  },

  async upsertProfile(profile) {
    return db.putUserProfile(profile)
  },

  async createBodyMeasurement(measurement) {
    const id = await db.addBodyMeasurement({
      ...measurement,
      updatedAt: measurement.updatedAt ?? measurement.fechaRegistro,
    })

    return id
  },
}
