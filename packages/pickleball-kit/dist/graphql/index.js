// src/graphql/index.ts
var BOOKING_FIELDS = `
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
var CHANGE_REQUEST_FIELDS = `
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
var COURTS_QUERY = `
  query Courts {
    courts { id name slug description amenities images isActive sortOrder }
  }
`;
var COURT_QUERY = `
  query Court($slug: String!) {
    court(slug: $slug) { id name slug description amenities images isActive }
  }
`;
var VENUE_QUERY = `
  query Venue {
    venue {
      id name description logoUrl
      address { street city province postalCode country }
      contact { phone email }
    }
  }
`;
var AVAILABLE_SLOTS_QUERY = `
  query AvailableSlots($courtId: ID!, $date: String!) {
    availableSlots(courtId: $courtId, date: $date) {
      startTime endTime available price
    }
  }
`;
var ME_QUERY = `
  query Me {
    me { id email firstName lastName phone role status permissions }
  }
`;
var LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id email firstName lastName phone role status permissions }
    }
  }
`;
var REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { id email firstName lastName phone role status permissions }
    }
  }
`;
var MY_BOOKINGS_QUERY = `
  ${BOOKING_FIELDS}
  query MyBookings($status: String, $limit: Int) {
    myBookings(status: $status, limit: $limit) { ...BookingFields }
  }
`;
var BOOKING_QUERY = `
  ${BOOKING_FIELDS}
  query Booking($id: ID!) {
    booking(id: $id) { ...BookingFields }
  }
`;
var ALL_BOOKINGS_QUERY = `
  ${BOOKING_FIELDS}
  query Bookings($status: String, $limit: Int) {
    bookings(status: $status, limit: $limit) { ...BookingFields }
  }
`;
var BOOKINGS_PAGE_QUERY = `
  ${BOOKING_FIELDS}
  query BookingsPage(
    $filter: AdminBookingFilterInput
    $limit: Int
    $offset: Int
  ) {
    bookingsPage(filter: $filter, limit: $limit, offset: $offset) {
      items {
        ...BookingFields
      }
      total
      limit
      offset
      hasMore
    }
  }
`;
var UPDATE_BOOKING_STATUS_MUTATION = `
  ${BOOKING_FIELDS}
  mutation UpdateBookingStatus($id: ID!, $input: UpdateBookingStatusInput!) {
    updateBookingStatus(id: $id, input: $input) {
      ...BookingFields
    }
  }
`;
var CREATE_BOOKING_HOLD_MUTATION = `
  ${BOOKING_FIELDS}
  mutation CreateBookingHold($input: CreateBookingHoldInput!) {
    createBookingHold(input: $input) { ...BookingFields }
  }
`;
var CANCEL_HOLD_MUTATION = `
  ${BOOKING_FIELDS}
  mutation CancelHold($bookingId: ID!) {
    cancelHold(bookingId: $bookingId) { ...BookingFields }
  }
`;
var MY_CHANGE_REQUESTS_QUERY = `
  ${CHANGE_REQUEST_FIELDS}
  query MyChangeRequests {
    myChangeRequests { ...ChangeRequestFields }
  }
`;
var CHANGE_REQUESTS_QUERY = `
  ${CHANGE_REQUEST_FIELDS}
  query ChangeRequests($status: String) {
    changeRequests(status: $status) { ...ChangeRequestFields }
  }
`;
var REQUEST_BOOKING_CHANGE_MUTATION = `
  ${CHANGE_REQUEST_FIELDS}
  mutation RequestBookingChange($input: RequestBookingChangeInput!) {
    requestBookingChange(input: $input) { ...ChangeRequestFields }
  }
`;
var REQUEST_BOOKING_CANCELLATION_MUTATION = `
  ${CHANGE_REQUEST_FIELDS}
  mutation RequestBookingCancellation($input: RequestBookingCancellationInput!) {
    requestBookingCancellation(input: $input) { ...ChangeRequestFields }
  }
`;
var REVIEW_CHANGE_REQUEST_MUTATION = `
  ${CHANGE_REQUEST_FIELDS}
  mutation ReviewChangeRequest($id: ID!, $input: ReviewChangeRequestInput!) {
    reviewChangeRequest(id: $id, input: $input) { ...ChangeRequestFields }
  }
`;
var BLOCK_SLOT_MUTATION = `
  mutation BlockSlot($input: CreateBlockedSlotInput!) {
    blockSlot(input: $input) {
      id courtId startTime endTime reason type
    }
  }
`;
var UNBLOCK_SLOT_MUTATION = `
  mutation UnblockSlot($id: ID!) { unblockSlot(id: $id) }
`;
var BOOKING_QUOTE_QUERY = `
  query BookingQuote($courtId: ID!, $startTime: String!, $duration: Int!) {
    bookingQuote(courtId: $courtId, startTime: $startTime, duration: $duration) {
      available reason startTime endTime duration basePrice fees discount total currency
    }
  }
`;
var BLOCKED_SLOTS_QUERY = `
  query BlockedSlots($courtId: ID, $from: String, $to: String) {
    blockedSlots(courtId: $courtId, from: $from, to: $to) {
      id courtId startTime endTime reason type
    }
  }
`;
var PAYMENT_FIELDS = `
  fragment PaymentFields on PaymentType {
    id bookingId userId amount currency method status
    gateway { provider transactionId referenceNumber fee }
    bankTransfer { bankName accountName referenceNumber proofImageUrl verifiedBy verifiedAt notes }
    paidAt refundedAt refundAmount refundReason checkoutUrl createdAt updatedAt
  }
`;
var MY_PAYMENTS_QUERY = `
  ${PAYMENT_FIELDS}
  query MyPayments {
    myPayments { ...PaymentFields }
  }
`;
var PAYMENTS_QUERY = `
  ${PAYMENT_FIELDS}
  query Payments($status: String) {
    payments(status: $status) { ...PaymentFields }
  }
`;
var PAYMENTS_PAGE_QUERY = `
  ${PAYMENT_FIELDS}
  query PaymentsPage(
    $filter: AdminPaymentFilterInput
    $limit: Int
    $offset: Int
  ) {
    paymentsPage(filter: $filter, limit: $limit, offset: $offset) {
      items {
        ...PaymentFields
      }
      total
      limit
      offset
      hasMore
    }
  }
`;
var PAYMENT_QUERY = `
  ${PAYMENT_FIELDS}
  query Payment($id: ID!) {
    payment(id: $id) { ...PaymentFields }
  }
`;
var INITIATE_PAYMENT_MUTATION = `
  ${PAYMENT_FIELDS}
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) { ...PaymentFields }
  }
`;
var VERIFY_BANK_TRANSFER_MUTATION = `
  ${PAYMENT_FIELDS}
  mutation VerifyBankTransfer($input: VerifyBankTransferInput!) {
    verifyBankTransfer(input: $input) { ...PaymentFields }
  }
`;
var REFUND_PAYMENT_MUTATION = `
  ${PAYMENT_FIELDS}
  mutation RequestRefund($input: RefundPaymentInput!) {
    requestRefund(input: $input) { ...PaymentFields }
  }
`;
var STAFF_QUERY = `
  query Staff {
    staff {
      id
      email
      firstName
      lastName
      phone
      role
      status
      permissions
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`;
var STAFF_PERMISSIONS_QUERY = `
  query StaffPermissions {
    staffPermissions
  }
`;
var CREATE_STAFF_MUTATION = `
  mutation CreateStaff($input: CreateStaffInput!) {
    createStaff(input: $input) {
      id
      email
      firstName
      lastName
      phone
      role
      status
      permissions
    }
  }
`;
var UPDATE_STAFF_MUTATION = `
  mutation UpdateStaff($id: ID!, $input: UpdateStaffInput!) {
    updateStaff(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      phone
      role
      status
      permissions
    }
  }
`;
var CUSTOMERS_QUERY = `
  query Customers($filter: CustomerFilterInput, $limit: Int, $offset: Int) {
    customers(filter: $filter, limit: $limit, offset: $offset) {
      items {
        id
        email
        firstName
        lastName
        phone
        status
        lastLoginAt
        createdAt
      }
      total
      limit
      offset
      hasMore
    }
  }
`;
var CUSTOMER_QUERY = `
  query Customer($id: ID!) {
    customer(id: $id) {
      id
      email
      firstName
      lastName
      phone
      status
      lastLoginAt
      createdAt
    }
  }
`;
var AUDIT_LOGS_QUERY = `
  query AuditLogs($filter: AuditLogFilterInput, $limit: Int, $offset: Int) {
    auditLogs(filter: $filter, limit: $limit, offset: $offset) {
      items {
        id
        actorId
        actorRole
        action
        resourceType
        resourceId
        metadata
        ipAddress
        userAgent
        createdAt
      }
      total
      limit
      offset
      hasMore
    }
  }
`;
var RESET_STAFF_PASSWORD_MUTATION = `
  mutation ResetStaffPassword($id: ID!, $input: UpdateStaffInput!) {
    updateStaff(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      role
      status
      permissions
    }
  }
`;
export {
  ALL_BOOKINGS_QUERY,
  AUDIT_LOGS_QUERY,
  AVAILABLE_SLOTS_QUERY,
  BLOCKED_SLOTS_QUERY,
  BLOCK_SLOT_MUTATION,
  BOOKINGS_PAGE_QUERY,
  BOOKING_QUERY,
  BOOKING_QUOTE_QUERY,
  CANCEL_HOLD_MUTATION,
  CHANGE_REQUESTS_QUERY,
  COURTS_QUERY,
  COURT_QUERY,
  CREATE_BOOKING_HOLD_MUTATION,
  CREATE_STAFF_MUTATION,
  CUSTOMERS_QUERY,
  CUSTOMER_QUERY,
  INITIATE_PAYMENT_MUTATION,
  LOGIN_MUTATION,
  ME_QUERY,
  MY_BOOKINGS_QUERY,
  MY_CHANGE_REQUESTS_QUERY,
  MY_PAYMENTS_QUERY,
  PAYMENTS_PAGE_QUERY,
  PAYMENTS_QUERY,
  PAYMENT_QUERY,
  REFUND_PAYMENT_MUTATION,
  REGISTER_MUTATION,
  REQUEST_BOOKING_CANCELLATION_MUTATION,
  REQUEST_BOOKING_CHANGE_MUTATION,
  RESET_STAFF_PASSWORD_MUTATION,
  REVIEW_CHANGE_REQUEST_MUTATION,
  STAFF_PERMISSIONS_QUERY,
  STAFF_QUERY,
  UNBLOCK_SLOT_MUTATION,
  UPDATE_BOOKING_STATUS_MUTATION,
  UPDATE_STAFF_MUTATION,
  VENUE_QUERY,
  VERIFY_BANK_TRANSFER_MUTATION
};
//# sourceMappingURL=index.js.map