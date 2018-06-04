# Grain

Coordinate your distributed services in a rapid, efficient enough and fault tolerant way in decentralized environment.

* Based on actor model abstraction for reusability, behavior transition, event-driven, transparent message passing and selective delivery guarantee semantics. 

* The underlying runtime implementation is based on virtual actor mechanism, which automatically deals with actor instance creation, migration, scaling, failure recovery and states replication. You don't need to handle with actor's lifecycle, failure handling like traditional actor framework. 

* To avoid centralized role, we adopt swim membership protocol, distributed consistent hash ring from [upring](https://github.com/upring/upring) for decentralized meta-information tracking and decision making, including task allocation, scaling and load balancing. The composed IoT devices has no single point of failure, encapsulate unstable members visibility and zero-pained configuration on cluster setup. 

* To solve the heterogeneity in IoT devices' context, we also provide annotation syntax within JSON schema pattern matching for selecting proper actor placement on different user-defined requirement, including hardware vendor, network communication capabilities, etc. The provided annotation can be an underlying abstraction for developing further complex context recognition and reasoning. 

* The application packaging and deployment fits in Node.js module system and can be automatically parsed from configuration files with dependency solving and version checking.

