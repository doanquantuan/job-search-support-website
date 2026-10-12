class Location {
  constructor({
    locationId,
    province,
    district = null,
    ward = null,
    address = null,
    createdAt,
    updatedAt,
  }) {
    this.locationId = locationId;
    this.province = province;
    this.district = district;
    this.ward = ward;
    this.address = address;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getFullAddress() {
    return [this.address, this.ward, this.district, this.province]
      .filter(Boolean)
      .join(', ');
  }

  toJSON() {
    return {
      locationId: this.locationId,
      province: this.province,
      district: this.district,
      ward: this.ward,
      address: this.address,
      fullAddress: this.getFullAddress(),
    };
  }
}

module.exports = Location;
