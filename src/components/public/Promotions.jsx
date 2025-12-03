export default function Promotions(){
    
    return(
      <div className="container mx-auto flex flex-col justify-center ">
        <h2 className="text-2xl md:text-3xl mx-auto text-center font-bold bg-gray-700 text-white inline-block px-6 py-2 rounded-t-lg border-b-4 border-orange-500">
            Promociones financieras
        </h2>
        <div className="w-full h-5 bg-gray-700 mb-4"></div>

        <div className="px-50 mx-auto">
          <div className="w-full">
            <img 
              src="https://imgs.search.brave.com/ErZ6l_gcYKPiwdL-UO185qJiwnmTb3jlHvgeZWFVZcU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9iYWJp/ZGlib28uY29tL2Nk/bi9zaG9wL3Byb2R1/Y3RzL05fNmIyY2Q1/ZjEtYTRiMC00Nzcz/LWE1YjgtMDI3NmY5/OTc0YjZkLnBuZz92/PTE2NDQ5NTA3Mzcm/d2lkdGg9MTQ0NQ" 
              className="w-full h-auto object-contain"
              alt="Promociones"
            />
          </div>
        </div>
      </div>
    );
}