if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/Users/ravendrasingh/.gradle/caches/9.3.1/transforms/82bb546c79f8535fcca6a065c6a8bee3/transformed/fbjni-0.7.0/prefab/modules/fbjni/libs/android.x86/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/ravendrasingh/.gradle/caches/9.3.1/transforms/82bb546c79f8535fcca6a065c6a8bee3/transformed/fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

