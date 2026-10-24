const BOOKING_FIELDS = `
  fragment BookingFields on BookingType {
    id
    bookingNumber
    userId
    courtId
    startTime
    endTime
    duration
    status
    pricing { basePrice fees discount total currency }
    holdExpiresAt
    cancellationReason
    notes
    createdAt
  }
`;

const CHANGE_REQUEST_FIELDS = `
  fragment ChangeRequestFields on ChangeRequestType {
    id
    bookingId
    userId
    type
    status
    requestedChanges { newStartTime newDuration newCourtId }
    reason
    staffResponse
    reviewedAt
    createdAt
  }
`;

export const COURTS_QUERY = `
  query Courts {
    courts { id name slug description amenities images isActive sortOrder }
  }
`;

export const COURT_QUERY = `
  query Court($slug: String!) {
    court(slug: $slug) { id name slug description amenities images isActive }
  }
`;

export const VENUE_QUERY = `
  query Venue {
    venue {
      id name description logoUrl
      address { street city province postalCode country }
      contact { phone email }
    }
  }
`;

export const AVAILABLE_SLOTS_QUERY = `
  query AvailableSlots($courtId: ID!, $date: String!) {
    availableSlots(courtId: $courtId, date: $date) {
      startTime endTime available price
    }
  }
`;

export const ME_QUERY = `
  query Me {
    me { id email firstName lastName phone role status }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id email firstName lastName phone role status }
    }
  }
`;

export const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { id email firstName lastName phone role status }
    }
  }
`;

export const MY_BOOKINGS_QUERY = `
  ${BOOKING_FIELDS}
  query MyBookings($status: String, $limit: Int) {
    myBookings(status: $status, limit: $limit) { ...BookingFields }
  }
`;

export const BOOKING_QUERY = `
  ${BOOKING_FIELDS}
  query Booking($id: ID!) {
    booking(id: $id) { ...BookingFields }
  }
`;

export const ALL_BOOKINGS_QUERY = `
  ${BOOKING_FIELDS}
  query Bookings($status: String, $limit: Int) {
    bookings(status: $status, limit: $limit) { ...BookingFields }
  }
`;

export const CREATE_BOOKING_HOLD_MUTATION = `
  ${BOOKING_FIELDS}
  mutation CreateBookingHold($input: CreateBookingHoldInput!) {
    createBookingHold(input: $input) { ...BookingFields }
  }
`;

export const CANCEL_HOLD_MUTATION = `
  ${BOOKING_FIELDS}
  mutation CancelHold($bookingId: ID!) {
    cancelHold(bookingId: $bookingId) { ...BookingFields }
  }
`;

export const MY_CHANGE_REQUESTS_QUERY = `
  ${CHANGE_REQUEST_FIELDS}
  query MyChangeRequests {
    myChangeRequests { ...ChangeRequestFields }
  }
`;

export const CHANGE_REQUESTS_QUERY = `
  ${CHANGE_REQUEST_FIELDS}
  query ChangeRequests($status: String) {
    changeRequests(status: $status) { ...ChangeRequestFields }
  }
`;

export const REQUEST_BOOKING_CHANGE_MUTATION = `
  ${CHANGE_REQUEST_FIELDS}
  mutation RequestBookingChange($input: RequestBookingChangeInput!) {
    requestBookingChange(input: $input) { ...ChangeRequestFields }
  }
`;

export const REQUEST_BOOKING_CANCELLATION_MUTATION = `
  ${CHANGE_REQUEST_FIELDS}
  mutation RequestBookingCancellation($input: RequestBookingCancellationInput!) {
    requestBookingCancellation(input: $input) { ...ChangeRequestFields }
  }
`;

export const REVIEW_CHANGE_REQUEST_MUTATION = `
  ${CHANGE_REQUEST_FIELDS}
  mutation ReviewChangeRequest($id: ID!, $input: ReviewChangeRequestInput!) {
    reviewChangeRequest(id: $id, input: $input) { ...ChangeRequestFields }
  }
`;

export const BLOCK_SLOT_MUTATION = `
  mutation BlockSlot($input: CreateBlockedSlotInput!) {
    blockSlot(input: $input) {
      id courtId startTime endTime reason type
    }
  }
`;

export const UNBLOCK_SLOT_MUTATION = `
  mutation UnblockSlot($id: ID!) { unblockSlot(id: $id) }
`;

export const BOOKING_QUOTE_QUERY = `
  query BookingQuote($courtId: ID!, $startTime: String!, $duration: Int!) {
    bookingQuote(courtId: $courtId, startTime: $startTime, duration: $duration) {
      available reason startTime endTime duration basePrice fees discount total currency
    }
  }
`;

export const BLOCKED_SLOTS_QUERY = `
  query BlockedSlots($courtId: ID, $from: String, $to: String) {
    blockedSlots(courtId: $courtId, from: $from, to: $to) {
      id courtId startTime endTime reason type
    }
  }
`;

const PAYMENT_FIELDS = `
  fragment PaymentFields on PaymentType {
    id bookingId userId amount currency method status
    gateway { provider transactionId referenceNumber fee }
    bankTransfer { bankName accountName referenceNumber proofImageUrl verifiedBy verifiedAt notes }
    paidAt refundedAt refundAmount refundReason checkoutUrl createdAt updatedAt
  }
`;

export const MY_PAYMENTS_QUERY = `
  ${PAYMENT_FIELDS}
  query MyPayments {
    myPayments { ...PaymentFields }
  }
`;

export const PAYMENTS_QUERY = `
  ${PAYMENT_FIELDS}
  query Payments($status: String) {
    payments(status: $status) { ...PaymentFields }
  }
`;

export const PAYMENT_QUERY = `
  ${PAYMENT_FIELDS}
  query Payment($id: ID!) {
    payment(id: $id) { ...PaymentFields }
  }
`;

export const INITIATE_PAYMENT_MUTATION = `
  ${PAYMENT_FIELDS}
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) { ...PaymentFields }
  }
`;

export const VERIFY_BANK_TRANSFER_MUTATION = `
  ${PAYMENT_FIELDS}
  mutation VerifyBankTransfer($input: VerifyBankTransferInput!) {
    verifyBankTransfer(input: $input) { ...PaymentFields }
  }
`;

export const REFUND_PAYMENT_MUTATION = `
  ${PAYMENT_FIELDS}
  mutation RequestRefund($input: RefundPaymentInput!) {
    requestRefund(input: $input) { ...PaymentFields }
  }
`;
